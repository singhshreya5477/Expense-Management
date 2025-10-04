const ApprovalRequest = require('../models/ApprovalRequest');
const Expense = require('../models/Expense');
const ApprovalRule = require('../models/ApprovalRule');

// Check if conditional rules are satisfied
const checkConditionalRules = async (expense, rule) => {
  const approvalRequests = await ApprovalRequest.find({ 
    expense: expense._id,
    status: 'Approved'
  });

  const totalApprovers = await ApprovalRequest.countDocuments({ expense: expense._id });
  const approvedCount = approvalRequests.length;

  // Percentage rule
  if (rule.conditionalRules.percentageRule.enabled) {
    const percentage = (approvedCount / totalApprovers) * 100;
    if (percentage >= rule.conditionalRules.percentageRule.percentage) {
      return true;
    }
  }

  // Specific approver rule
  if (rule.conditionalRules.specificApproverRule.enabled) {
    const specificApprovers = rule.conditionalRules.specificApproverRule.approvers.map(a => a.toString());
    const approvedBy = approvalRequests.map(r => r.approver.toString());
    
    const hasSpecificApprover = specificApprovers.some(sa => approvedBy.includes(sa));
    if (hasSpecificApprover) {
      return true;
    }
  }

  // Hybrid rule
  if (rule.conditionalRules.hybridRule.enabled) {
    const percentageMet = rule.conditionalRules.percentageRule.enabled &&
      (approvedCount / totalApprovers) * 100 >= rule.conditionalRules.percentageRule.percentage;
    
    const specificApprovers = rule.conditionalRules.specificApproverRule.approvers.map(a => a.toString());
    const approvedBy = approvalRequests.map(r => r.approver.toString());
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
    expense: expense._id,
    stepNumber: currentStep,
    status: 'Pending'
  });

  if (pendingInCurrentStep) {
    return; // Wait for all in current step
  }

  // Check if any rejected in current step
  const rejectedInCurrentStep = await ApprovalRequest.findOne({
    expense: expense._id,
    stepNumber: currentStep,
    status: 'Rejected'
  });

  if (rejectedInCurrentStep) {
    expense.status = 'Rejected';
    await expense.save();
    return;
  }

  // Move to next step
  const nextStep = currentStep + 1;
  const nextStepExists = await ApprovalRequest.findOne({
    expense: expense._id,
    stepNumber: nextStep
  });

  if (nextStepExists) {
    expense.currentApprovalStep = nextStep;
    await expense.save();
  } else {
    // No more steps, approve expense
    expense.status = 'Approved';
    expense.finalApprovalDate = new Date();
    await expense.save();
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingRequests = await ApprovalRequest.find({
      approver: req.user._id,
      status: 'Pending'
    })
    .populate({
      path: 'expense',
      populate: { path: 'employee', select: 'name email' }
    })
    .sort('createdAt');

    // Filter to only show requests for current step
    const currentStepRequests = [];
    for (const request of pendingRequests) {
      if (request.expense && request.stepNumber === request.expense.currentApprovalStep) {
        currentStepRequests.push(request);
      }
    }

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
      _id: req.params.requestId,
      approver: req.user._id,
      status: 'Pending'
    });

    if (!approvalRequest) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const expense = await Expense.findById(approvalRequest.expense);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Check if request is for current step
    if (approvalRequest.stepNumber !== expense.currentApprovalStep) {
      return res.status(400).json({ success: false, message: 'Cannot approve at this step yet' });
    }

    approvalRequest.status = 'Approved';
    approvalRequest.comments = comments;
    approvalRequest.actionDate = new Date();
    await approvalRequest.save();

    // Add comment to expense
    expense.comments.push({
      user: req.user._id,
      comment: comments || 'Approved',
      action: 'Approved'
    });
    expense.finalApprover = req.user._id;
    await expense.save();

    // Check conditional rules if applicable
    const rule = await ApprovalRule.findOne({ 
      company: expense.company,
      isActive: true
    });

    if (rule && rule.ruleType !== 'Sequential') {
      const conditionsSatisfied = await checkConditionalRules(expense, rule);
      if (conditionsSatisfied) {
        expense.status = 'Approved';
        expense.finalApprovalDate = new Date();
        await expense.save();
        
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
      _id: req.params.requestId,
      approver: req.user._id,
      status: 'Pending'
    });

    if (!approvalRequest) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const expense = await Expense.findById(approvalRequest.expense);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    approvalRequest.status = 'Rejected';
    approvalRequest.comments = comments;
    approvalRequest.actionDate = new Date();
    await approvalRequest.save();

    expense.status = 'Rejected';
    expense.comments.push({
      user: req.user._id,
      comment: comments || 'Rejected',
      action: 'Rejected'
    });
    expense.finalApprover = req.user._id;
    expense.finalApprovalDate = new Date();
    await expense.save();

    res.json({ success: true, message: 'Expense rejected', approvalRequest, expense });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
