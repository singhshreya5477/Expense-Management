const { Expense, Company, ApprovalRule, ApprovalRequest, User, sequelize } = require('../models');
const { Op } = require('sequelize');
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
  const rules = await ApprovalRule.findAll({
    where: {
      companyId: companyId,
      isActive: true
    },
    order: [
      [sequelize.literal("(amountThreshold->>'min')::numeric"), 'DESC']
    ]
  });

  for (const rule of rules) {
    const categoriesMatch = !rule.categories || rule.categories.length === 0 || rule.categories.includes(category);
    const meetsThreshold = 
      amount >= (rule.amountThreshold?.min || 0) &&
      (rule.amountThreshold?.max === null || amount <= rule.amountThreshold?.max);
    
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
  if (employee.isManagerApprover && employee.managerId) {
    requests.push({
      expenseId: expense.id,
      approverId: employee.managerId,
      stepNumber: stepNumber++,
      status: 'Pending'
    });
  }

  // Create requests for each step in rule
  if (rule && rule.steps && rule.steps.length > 0) {
    for (const step of rule.steps) {
      if (step.approvers && step.approvers.length > 0) {
        for (const approverId of step.approvers) {
          requests.push({
            expenseId: expense.id,
            approverId: approverId,
            stepNumber: stepNumber + step.stepNumber,
            status: 'Pending'
          });
        }
      }
    }
  }

  if (requests.length > 0) {
    await ApprovalRequest.bulkCreate(requests);
    expense.status = 'In Progress';
    logger.info(`Created ${requests.length} approval requests for expense ${expense.id}`);
  } else {
    // No approval needed, auto-approve
    expense.status = 'Approved';
    expense.finalApprovalDate = new Date();
    logger.info(`Expense ${expense.id} auto-approved (no approval rules)`);
  }

  return requests;
};

exports.createExpense = asyncHandler(async (req, res, next) => {
  const { amount, currency, category, description, date, expenseLines, merchant, notes } = req.body;

  if (!amount || !currency || !category || !description || !date) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const company = await Company.findByPk(req.user.companyId);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  // Convert amount to company currency
  const convertedAmount = await convertCurrency(amount, currency, company.currency.code);

  // Get receipt path from multer if file was uploaded
  const receiptPath = req.file ? `/uploads/receipts/${req.file.filename}` : null;

  const expense = await Expense.create({
    employeeId: req.user.id,
    companyId: req.user.companyId,
    amount,
    currency: { code: currency, symbol: req.body.currencySymbol || currency },
    convertedAmount,
    category,
    description,
    date: new Date(date),
    merchant: merchant || null,
    notes: notes || null,
    expenseLines: expenseLines ? JSON.parse(expenseLines) : [],
    receipt: receiptPath
  });

  // Find and apply approval rule
  const employee = await User.findByPk(req.user.id);
  const rule = await findApprovalRule(req.user.companyId, convertedAmount, category);
  
  await createApprovalRequests(expense, rule, employee);
  await expense.save();

  logger.info(`Expense created: ${expense.id} by ${req.user.email}`);

  res.status(201).json({ 
    success: true, 
    expense,
    message: expense.status === 'Approved' ? 'Expense auto-approved' : 'Expense submitted for approval'
  });
});

exports.getExpenses = asyncHandler(async (req, res, next) => {
  const { status, category, startDate, endDate, page = 1, limit = 10 } = req.query;

  let where = { companyId: req.user.companyId };

  // Role-based filtering
  if (req.user.role === 'Manager') {
    const teamMembers = await User.findAll({ 
      where: { managerId: req.user.id },
      attributes: ['id']
    });
    const teamIds = teamMembers.map(m => m.id);
    where.employeeId = { [Op.in]: [...teamIds, req.user.id] };
  } else if (req.user.role === 'Employee') {
    where.employeeId = req.user.id;
  }

  // Additional filters
  if (status) where.status = status;
  if (category) where.category = category;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = new Date(startDate);
    if (endDate) where.date[Op.lte] = new Date(endDate);
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count: total, rows: expenses } = await Expense.findAndCountAll({
    where,
    include: [
      { 
        model: User, 
        as: 'employee', 
        attributes: ['id', 'name', 'email'] 
      }
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit: parseInt(limit)
  });

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
  
  let where = { employeeId: req.user.id };
  if (status) where.status = status;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count: total, rows: expenses } = await Expense.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset,
    limit: parseInt(limit)
  });

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
    where: {
      id: req.params.id, 
      companyId: req.user.companyId 
    },
    include: [
      { 
        model: User, 
        as: 'employee', 
        attributes: ['id', 'name', 'email', 'role'] 
      },
      { 
        model: User, 
        as: 'finalApprover', 
        attributes: ['id', 'name', 'email'] 
      }
    ]
  });

  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  // Check permissions
  const isOwner = expense.employeeId === req.user.id;
  const isAdmin = req.user.role === 'Admin';
  const isManager = req.user.role === 'Manager';

  if (!isOwner && !isAdmin && !isManager) {
    return next(new AppError('You do not have permission to view this expense', 403));
  }

  res.json({ success: true, expense });
});

exports.updateExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOne({ 
    where: {
      id: req.params.id, 
      employeeId: req.user.id,
      status: { [Op.in]: ['Pending', 'Rejected'] }
    }
  });

  if (!expense) {
    return next(new AppError('Expense not found or cannot be updated', 404));
  }

  const { amount, currency, category, description, date, expenseLines } = req.body;
  const company = await Company.findByPk(req.user.companyId);

  const updateData = {};

  if (amount && currency) {
    updateData.amount = amount;
    updateData.currency = { code: currency, symbol: req.body.currencySymbol || currency };
    updateData.convertedAmount = await convertCurrency(amount, currency, company.currency.code);
  }

  if (category) updateData.category = category;
  if (description) updateData.description = description;
  if (date) updateData.date = new Date(date);
  if (expenseLines) updateData.expenseLines = expenseLines;

  // If expense was rejected, reset approval workflow
  if (expense.status === 'Rejected') {
    updateData.status = 'Pending';
    updateData.currentApprovalStep = 0;
    updateData.comments = [];
    updateData.finalApproverId = null;
    updateData.finalApprovalDate = null;
    
    // Delete old approval requests
    await ApprovalRequest.destroy({ where: { expenseId: expense.id } });
    
    await expense.update(updateData);
    
    // Create new approval workflow
    const employee = await User.findByPk(req.user.id);
    const rule = await findApprovalRule(req.user.companyId, expense.convertedAmount, expense.category);
    await createApprovalRequests(expense, rule, employee);
    await expense.save();
  } else {
    await expense.update(updateData);
  }

  logger.info(`Expense updated: ${expense.id} by ${req.user.email}`);

  res.json({ success: true, expense });
});

exports.deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOne({ 
    where: {
      id: req.params.id, 
      employeeId: req.user.id,
      status: 'Pending'
    }
  });

  if (!expense) {
    return next(new AppError('Expense not found or cannot be deleted', 404));
  }

  // Delete associated approval requests
  await ApprovalRequest.destroy({ where: { expenseId: expense.id } });
  
  await expense.destroy();

  logger.info(`Expense deleted: ${expense.id} by ${req.user.email}`);

  res.json({ success: true, message: 'Expense deleted successfully' });
});
