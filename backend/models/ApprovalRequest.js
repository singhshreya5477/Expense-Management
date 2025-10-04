const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApprovalRequest = sequelize.define('ApprovalRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  expenseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Expenses',
      key: 'id'
    }
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actionDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'ApprovalRequests',
  timestamps: true,
  indexes: [
    {
      fields: ['expenseId', 'stepNumber']
    }
  ]
});

module.exports = ApprovalRequest;
