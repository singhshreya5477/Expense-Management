const { ApprovalRequest, Expense, ApprovalRule, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Check if conditional rules are satisfied
const checkConditionalRules = async (expense, rule) => {
  const approvalRequests = await ApprovalRequest.findAll({ 
    where: {
      expenseId: expense.id,
      status: 'Approved'
    }
  });

  const totalApprovers = await ApprovalRequest.count({ where: { expenseId: expense.id } });
  const approvedCount = approvalRequests.length;

  // Percentage rule
  if (rule.conditionalRules?.percentageRule?.enabled) {
    const percentage = (approvedCount / totalApprovers) * 100;
    if (percentage >= rule.conditionalRules.percentageRule.percentage) {
      return true;
    }
  }

  // Specific approver rule
  if (rule.conditionalRules?.specificApproverRule?.enabled) {
    const specificApprovers = rule.conditionalRules.specificApproverRule.approvers || [];
    const approvedBy = approvalRequests.map(r => r.approverId);
    
    const hasSpecificApprover = specificApprovers.some(sa => approvedBy.includes(sa));
    if (hasSpecificApprover) {
      return true;
    }
  }

  // Hybrid rule
  if (rule.conditionalRules?.hybridRule?.enabled) {
    const percentageMet = rule.conditionalRules.percentageRule?.enabled &&
      (approvedCount / totalApprovers) * 100 >= (rule.conditionalRules.percentageRule?.percentage || 0);
    
    const specificApprovers = rule.conditionalRules.specificApproverRule?.approvers || [];
    const approvedBy = approvalRequests.map(r => r.approverId);
    const specificApproverMet = specificApprovers.some(sa => approvedBy.includes(sa));

    if (rule.conditionalRules.hybridRule.operator === 'OR') {
      return percentageMet || specificApproverMet;
    } else {
      return percentageMet && specificApproverMet;
    }
  }

  return false;
};

// Process next step in approval workflow
const processNextStep = async (expense) => {
  const currentStep = expense.currentApprovalStep;
  
  // Check if all requests in current step are processed
  const pendingInCurrentStep = await ApprovalRequest.findOne({
    where: {
      expenseId: expense.id,
      stepNumber: currentStep,
      status: 'Pending'
    }
  });

  if (pendingInCurrentStep) {
    return; // Wait for all in current step
  }

  // Check if any rejected in current step
  const rejectedInCurrentStep = await ApprovalRequest.findOne({
    where: {
      expenseId: expense.id,
      stepNumber: currentStep,
      status: 'Rejected'
    }
  });

  if (rejectedInCurrentStep) {
    await expense.update({ status: 'Rejected' });
    return;
  }

  // Move to next step
  const nextStep = currentStep + 1;
  const nextStepExists = await ApprovalRequest.findOne({
    where: {
      expenseId: expense.id,
      stepNumber: nextStep
    }
  });

  if (nextStepExists) {
    await expense.update({ currentApprovalStep: nextStep });
  } else {
    // No more steps, approve expense
    await expense.update({ 
      status: 'Approved',
      finalApprovalDate: new Date()
    });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingRequests = await ApprovalRequest.findAll({
      where: {
        approverId: req.user.id,
        status: 'Pending'
      },
      include: [
        {
          model: Expense,
          as: 'expense',
          include: [
            { 
              model: User, 
              as: 'employee', 
              attributes: ['id', 'name', 'email'] 
            }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Filter to only show requests for current step
    const currentStepRequests = pendingRequests.filter(request => 
      request.expense && request.stepNumber === request.expense.currentApprovalStep
    );

    res.json({ success: true, approvalRequests: currentStepRequests });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveExpense = async (req, res) => {
  try {
    const { comments } = req.body;

    const approvalRequest = await ApprovalRequest.findOne({
      where: {
        id: req.params.requestId,
        approverId: req.user.id,
        status: 'Pending'
      }
    });

    if (!approvalRequest) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const expense = await Expense.findByPk(approvalRequest.expenseId);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Check if request is for current step
    if (approvalRequest.stepNumber !== expense.currentApprovalStep) {
      return res.status(400).json({ success: false, message: 'Cannot approve at this step yet' });
    }

    await approvalRequest.update({
      status: 'Approved',
      comments: comments,
      actionDate: new Date()
    });

    // Add comment to expense
    const currentComments = expense.comments || [];
    currentComments.push({
      user: req.user.id,
      comment: comments || 'Approved',
      action: 'Approved',
      date: new Date()
    });
    
    await expense.update({ 
      comments: currentComments,
      finalApproverId: req.user.id
    });

    // Check conditional rules if applicable
    const rule = await ApprovalRule.findOne({ 
      where: {
        companyId: expense.companyId,
        isActive: true
      }
    });

    if (rule && rule.ruleType !== 'Sequential') {
      const conditionsSatisfied = await checkConditionalRules(expense, rule);
      if (conditionsSatisfied) {
        await expense.update({ 
          status: 'Approved',
          finalApprovalDate: new Date()
        });
        
        return res.json({ 
          success: true, 
          message: 'Expense approved (conditional rules satisfied)',
          approvalRequest,
          expense 
        });
      }
    }

    // Process next step
    await processNextStep(expense);

    res.json({ success: true, message: 'Expense approved', approvalRequest, expense });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.rejectExpense = async (req, res) => {
  try {
    const { comments } = req.body;

    const approvalRequest = await ApprovalRequest.findOne({
      where: {
        id: req.params.requestId,
        approverId: req.user.id,
        status: 'Pending'
      }
    });

    if (!approvalRequest) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const expense = await Expense.findByPk(approvalRequest.expenseId);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await approvalRequest.update({
      status: 'Rejected',
      comments: comments,
      actionDate: new Date()
    });

    const currentComments = expense.comments || [];
    currentComments.push({
      user: req.user.id,
      comment: comments || 'Rejected',
      action: 'Rejected',
      date: new Date()
    });

    await expense.update({
      status: 'Rejected',
      comments: currentComments,
      finalApproverId: req.user.id,
      finalApprovalDate: new Date()
    });

    res.json({ success: true, message: 'Expense rejected', approvalRequest, expense });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = exports;
