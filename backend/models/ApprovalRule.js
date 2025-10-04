const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApprovalRule = sequelize.define('ApprovalRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ruleType: {
    type: DataTypes.ENUM('Sequential', 'Conditional', 'Hybrid'),
    allowNull: false
  },
  steps: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  conditionalRules: {
    type: DataTypes.JSONB,
    defaultValue: {
      percentageRule: {
        enabled: false,
        percentage: 0
      },
      specificApproverRule: {
        enabled: false,
        approvers: []
      },
      hybridRule: {
        enabled: false,
        operator: 'AND'
      }
    }
  },
  amountThreshold: {
    type: DataTypes.JSONB,
    defaultValue: {
      min: 0,
      max: null
    }
  },
  categories: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'ApprovalRules',
  timestamps: true
});

module.exports = ApprovalRule;
