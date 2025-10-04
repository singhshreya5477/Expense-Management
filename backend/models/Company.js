const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('name', value.trim());
    }
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Not Specified'
  },
  currency: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      hasRequiredFields(value) {
        if (!value || !value.code || !value.symbol || !value.name) {
          throw new Error('Currency must have code, symbol, and name');
        }
      }
    }
  },
  adminUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'Companies',
  timestamps: true
});

module.exports = Company;
