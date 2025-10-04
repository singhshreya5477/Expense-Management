const ApprovalRule = require('../models/ApprovalRule');

exports.createApprovalRule = async (req, res) => {
  try {
    const { 
      name, 
      ruleType, 
      steps, 
      conditionalRules, 
      amountThreshold, 
      categories 
    } = req.body;

    const rule = new ApprovalRule({
      company: req.user.company,
      name,
      ruleType,
      steps,
      conditionalRules,
      amountThreshold,
      categories: categories || []
    });

    await rule.save();

    res.status(201).json({ success: true, rule });
  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ company: req.user.company })
      .populate('steps.approvers', 'name email role');

    res.json({ success: true, rules });
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findOne({ 
      _id: req.params.id, 
      company: req.user.company 
    }).populate('steps.approvers', 'name email role');

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Approval rule not found' });
    }

    res.json({ success: true, rule });
  } catch (error) {
    console.error('Get approval rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findOne({ 
      _id: req.params.id, 
      company: req.user.company 
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Approval rule not found' });
    }

    const allowedUpdates = [
      'name', 'ruleType', 'steps', 'conditionalRules', 
      'amountThreshold', 'categories', 'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        rule[field] = req.body[field];
      }
    });

    await rule.save();

    res.json({ success: true, rule });
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findOneAndDelete({ 
      _id: req.params.id, 
      company: req.user.company 
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Approval rule not found' });
    }

    res.json({ success: true, message: 'Approval rule deleted successfully' });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
