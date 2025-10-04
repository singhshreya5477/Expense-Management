const Expense = require('../models/Expense');
const Company = require('../models/Company');
const ApprovalRule = require('../models/ApprovalRule');
const ApprovalRequest = require('../models/ApprovalRequest');
const User = require('../models/User');
const axios = require('axios');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const cache = require('../utils/cache');

// Convert amount to company currency with caching
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const cacheKey = `exchange_${fromCurrency}_${toCurrency}`;
  let rate = cache.get(cacheKey);

  if (!rate) {
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
        { timeout: 5000 }
      );
      
      rate = response.data.rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }
      
      // Cache for 30 minutes
      cache.set(cacheKey, rate, 1800);
    } catch (error) {
      logger.error('Currency conversion error:', error);
      throw new AppError('Currency conversion failed. Please try again later.', 500);
    }
  }

  return parseFloat((amount * rate).toFixed(2));
};

// Find matching approval rule
const findApprovalRule = async (companyId, amount, category) => {
  const rules = await ApprovalRule.find({
    company: companyId,
    isActive: true
  })
  .populate('steps.approvers')
  .sort({ 'amountThreshold.min': -1 }); // Start with highest threshold

  for (const rule of rules) {
    const categoriesMatch = rule.categories.length === 0 || rule.categories.includes(category);
    const meetsThreshold = 
      amount >= rule.amountThreshold.min &&
      (rule.amountThreshold.max === null || amount <= rule.amountThreshold.max);
    
    if (meetsThreshold && categoriesMatch) {
      return rule;
    }
  }

  return null;
};

// Create approval requests based on rule
const createApprovalRequests = async (expense, rule, employee) => {
  const requests = [];
  let stepNumber = 0;

  // If manager approval is required, add as step 0
  if (employee.isManagerApprover && employee.manager) {
    requests.push({
      expense: expense._id,
      approver: employee.manager,
      stepNumber: stepNumber++,
      status: 'Pending'
    });
  }

  // Create requests for each step in rule
  if (rule && rule.steps && rule.steps.length > 0) {
    for (const step of rule.steps) {
      for (const approver of step.approvers) {
        requests.push({
          expense: expense._id,
          approver: approver._id,
          stepNumber: stepNumber + step.stepNumber,
          status: 'Pending'
        });
      }
    }
  }

  if (requests.length > 0) {
    await ApprovalRequest.insertMany(requests);
    expense.status = 'In Progress';
    logger.info(`Created ${requests.length} approval requests for expense ${expense._id}`);
  } else {
    // No approval needed, auto-approve
    expense.status = 'Approved';
    expense.finalApprovalDate = new Date();
    logger.info(`Expense ${expense._id} auto-approved (no approval rules)`);
  }

  return requests;
};

exports.createExpense = asyncHandler(async (req, res, next) => {
  const { amount, currency, category, description, date, expenseLines, receipt } = req.body;

  if (!amount || !currency || !category || !description || !date) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const company = await Company.findById(req.user.company);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  // Convert amount to company currency
  const convertedAmount = await convertCurrency(amount, currency, company.currency.code);

  const expense = new Expense({
    employee: req.user._id,
    company: req.user.company,
    amount,
    currency: { code: currency, symbol: req.body.currencySymbol || currency },
    convertedAmount,
    category,
    description,
    date: new Date(date),
    expenseLines: expenseLines || [],
    receipt: receipt || null
  });

  await expense.save();

  // Find and apply approval rule
  const employee = await User.findById(req.user._id);
  const rule = await findApprovalRule(req.user.company, convertedAmount, category);
  
  await createApprovalRequests(expense, rule, employee);
  await expense.save();

  logger.info(`Expense created: ${expense._id} by ${req.user.email}`);

  res.status(201).json({ 
    success: true, 
    expense,
    message: expense.status === 'Approved' ? 'Expense auto-approved' : 'Expense submitted for approval'
  });
});

exports.getExpenses = asyncHandler(async (req, res, next) => {
  const { status, category, startDate, endDate, page = 1, limit = 10 } = req.query;

  let query = { company: req.user.company };

  // Role-based filtering
  if (req.user.role === 'Manager') {
    const teamMembers = await User.find({ manager: req.user._id }).select('_id');
    const teamIds = teamMembers.map(m => m._id);
    query.employee = { $in: [...teamIds, req.user._id] };
  } else if (req.user.role === 'Employee') {
    query.employee = req.user._id;
  }

  // Additional filters
  if (status) query.status = status;
  if (category) query.category = category;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .populate('employee', 'name email')
      .populate('comments.user', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Expense.countDocuments(query)
  ]);

  res.json({ 
    success: true, 
    expenses,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getMyExpenses = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  let query = { employee: req.user._id };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .populate('comments.user', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Expense.countDocuments(query)
  ]);

  res.json({ 
    success: true, 
    expenses,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOne({ 
    _id: req.params.id, 
    company: req.user.company 
  })
    .populate('employee', 'name email role')
    .populate('comments.user', 'name role')
    .populate('finalApprover', 'name email');

  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  // Check permissions
  const isOwner = expense.employee._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'Admin';
  const isManager = req.user.role === 'Manager';

  if (!isOwner && !isAdmin && !isManager) {
    return next(new AppError('You do not have permission to view this expense', 403));
  }

  res.json({ success: true, expense });
});

exports.updateExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOne({ 
    _id: req.params.id, 
    employee: req.user._id,
    status: { $in: ['Pending', 'Rejected'] }
  });

  if (!expense) {
    return next(new AppError('Expense not found or cannot be updated', 404));
  }

  const { amount, currency, category, description, date, expenseLines } = req.body;
  const company = await Company.findById(req.user.company);

  if (amount && currency) {
    expense.amount = amount;
    expense.currency = { code: currency, symbol: req.body.currencySymbol || currency };
    expense.convertedAmount = await convertCurrency(amount, currency, company.currency.code);
  }

  if (category) expense.category = category;
  if (description) expense.description = description;
  if (date) expense.date = new Date(date);
  if (expenseLines) expense.expenseLines = expenseLines;

  // If expense was rejected, reset approval workflow
  if (expense.status === 'Rejected') {
    expense.status = 'Pending';
    expense.currentApprovalStep = 0;
    expense.comments = [];
    expense.finalApprover = null;
    expense.finalApprovalDate = null;
    
    // Delete old approval requests
    await ApprovalRequest.deleteMany({ expense: expense._id });
    
    // Create new approval workflow
    const employee = await User.findById(req.user._id);
    const rule = await findApprovalRule(req.user.company, expense.convertedAmount, expense.category);
    await createApprovalRequests(expense, rule, employee);
  }

  await expense.save();

  logger.info(`Expense updated: ${expense._id} by ${req.user.email}`);

  res.json({ success: true, expense });
});

exports.deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOneAndDelete({ 
    _id: req.params.id, 
    employee: req.user._id,
    status: 'Pending'
  });

  if (!expense) {
    return next(new AppError('Expense not found or cannot be deleted', 404));
  }

  // Delete associated approval requests
  await ApprovalRequest.deleteMany({ expense: expense._id });

  logger.info(`Expense deleted: ${expense._id} by ${req.user.email}`);

  res.json({ success: true, message: 'Expense deleted successfully' });
});
