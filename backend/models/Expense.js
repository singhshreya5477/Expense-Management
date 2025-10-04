const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  convertedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Travel', 'Food', 'Accommodation', 'Transport', 'Office Supplies', 'Entertainment', 'Other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  merchant: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receipt: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expenseLines: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'In Progress'),
    defaultValue: 'Pending'
  },
  currentApprovalStep: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  finalApproverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  finalApprovalDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  comments: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'Expenses',
  timestamps: true,
  underscored: false
});

module.exports = Expense;
