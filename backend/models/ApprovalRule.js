const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  ruleType: {
    type: String,
    enum: ['Sequential', 'Conditional', 'Hybrid'],
    required: true
  },
  steps: [{
    stepNumber: Number,
    approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    requireManagerApproval: { type: Boolean, default: false }
  }],
  conditionalRules: {
    percentageRule: {
      enabled: { type: Boolean, default: false },
      percentage: { type: Number, min: 0, max: 100 }
    },
    specificApproverRule: {
      enabled: { type: Boolean, default: false },
      approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    hybridRule: {
      enabled: { type: Boolean, default: false },
      operator: { type: String, enum: ['AND', 'OR'] }
    }
  },
  amountThreshold: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: null }
  },
  categories: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
