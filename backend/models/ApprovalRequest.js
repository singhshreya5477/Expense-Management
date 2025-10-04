const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stepNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  comments: String,
  actionDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

approvalRequestSchema.index({ expense: 1, stepNumber: 1 });

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
