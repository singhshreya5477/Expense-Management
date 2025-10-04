const sequelize = require('../config/database');
const User = require('./User');
const Company = require('./Company');
const Expense = require('./Expense');
const ApprovalRequest = require('./ApprovalRequest');
const ApprovalRule = require('./ApprovalRule');

// Define associations

// Company associations
Company.hasMany(User, { 
  foreignKey: 'companyId', 
  as: 'users' 
});
Company.hasMany(Expense, { 
  foreignKey: 'companyId', 
  as: 'expenses' 
});
Company.hasMany(ApprovalRule, { 
  foreignKey: 'companyId', 
  as: 'approvalRules' 
});

// User associations
User.belongsTo(Company, { 
  foreignKey: 'companyId', 
  as: 'company' 
});
User.belongsTo(User, { 
  foreignKey: 'managerId', 
  as: 'manager' 
});
User.hasMany(User, { 
  foreignKey: 'managerId', 
  as: 'subordinates' 
});
User.hasMany(Expense, { 
  foreignKey: 'employeeId', 
  as: 'expenses' 
});
User.hasMany(ApprovalRequest, { 
  foreignKey: 'approverId', 
  as: 'approvalRequests' 
});

// Expense associations
Expense.belongsTo(User, { 
  foreignKey: 'employeeId', 
  as: 'employee' 
});
Expense.belongsTo(Company, { 
  foreignKey: 'companyId', 
  as: 'company' 
});
Expense.belongsTo(User, { 
  foreignKey: 'finalApproverId', 
  as: 'finalApprover' 
});
Expense.hasMany(ApprovalRequest, { 
  foreignKey: 'expenseId', 
  as: 'approvalRequests' 
});

// ApprovalRequest associations
ApprovalRequest.belongsTo(Expense, { 
  foreignKey: 'expenseId', 
  as: 'expense' 
});
ApprovalRequest.belongsTo(User, { 
  foreignKey: 'approverId', 
  as: 'approver' 
});

// ApprovalRule associations
ApprovalRule.belongsTo(Company, { 
  foreignKey: 'companyId', 
  as: 'company' 
});

module.exports = {
  sequelize,
  User,
  Company,
  Expense,
  ApprovalRequest,
  ApprovalRule
};
