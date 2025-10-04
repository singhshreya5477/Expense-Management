const mongoose = require('mongoose');

const expenseLineSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String
});

const expenseSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    code: { type: String, required: true },
    symbol: String
  },
  convertedAmount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Travel', 'Food', 'Accommodation', 'Transport', 'Office Supplies', 'Entertainment', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  receipt: {
    filename: String,
    path: String,
    extractedData: {
      merchantName: String,
      amount: Number,
      date: Date,
      items: [expenseLineSchema]
    }
  },
  expenseLines: [expenseLineSchema],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress'],
    default: 'Pending'
  },
  currentApprovalStep: {
    type: Number,
    default: 0
  },
  finalApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finalApprovalDate: Date,
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    action: { type: String, enum: ['Approved', 'Rejected', 'Comment'] },
    date: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
