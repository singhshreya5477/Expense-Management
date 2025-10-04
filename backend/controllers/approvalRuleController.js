const { ApprovalRule, User } = require('../models');

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

    const rule = await ApprovalRule.create({
      companyId: req.user.companyId,
      name,
      ruleType,
      steps,
      conditionalRules,
      amountThreshold,
      categories: categories || []
    });

    res.status(201).json({ success: true, rule });
  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.findAll({ 
      where: { companyId: req.user.companyId }
    });

    res.json({ success: true, rules });
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findOne({ 
      where: {
        id: req.params.id, 
        companyId: req.user.companyId 
      }
    });

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
      where: {
        id: req.params.id, 
        companyId: req.user.companyId 
      }
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Approval rule not found' });
    }

    const allowedUpdates = [
      'name', 'ruleType', 'steps', 'conditionalRules', 
      'amountThreshold', 'categories', 'isActive'
    ];

    const updateData = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await rule.update(updateData);

    res.json({ success: true, rule });
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findOne({ 
      where: {
        id: req.params.id, 
        companyId: req.user.companyId 
      }
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Approval rule not found' });
    }

    await rule.destroy();

    res.json({ success: true, message: 'Approval rule deleted successfully' });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
