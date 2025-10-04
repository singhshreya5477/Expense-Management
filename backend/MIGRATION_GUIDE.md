# PostgreSQL Migration Guide

## Database Migration from MongoDB to PostgreSQL

This document outlines the complete migration process and next steps.

## ✅ Completed Changes

### 1. Dependencies Updated (`package.json`)
- **Removed:** `mongoose`, `express-mongo-sanitize`
- **Added:** `sequelize`, `pg`, `pg-hstore`, `sequelize-cli`

### 2. Environment Configuration (`.env`)
- Changed from `MONGODB_URI` to `DATABASE_URL`
- New format: `postgresql://localhost:5432/expense_management`

### 3. Database Configuration
- Created `config/database.js` with Sequelize connection pooling

### 4. All Models Migrated to Sequelize
- `User.js` - UUID primary keys, bcrypt hooks
- `Company.js` - JSONB for currency
- `Expense.js` - JSONB for nested objects (receipt, expenseLines, comments)
- `ApprovalRequest.js` - with proper indexes
- `ApprovalRule.js` - JSONB for complex nested rules
- `models/index.js` - centralized model exports with associations

### 5. Server.js Updated
- Replaced Mongoose with Sequelize
- Removed `express-mongo-sanitize` middleware
- Updated database connection logic
- Modified health check endpoint

### 6. All Controllers Migrated
- ✅ `authController.js` - Sequelize transactions for signup
- ✅ `userController.js` - findAll, includes, attributes
- ✅ `companyController.js` - findByPk queries
- ✅ `expenseController.js` - Op operators, complex queries
- ✅ `approvalController.js` - transaction handling
- ✅ `approvalRuleController.js` - JSONB queries
- ✅ `ocrController.js` - No changes needed (no DB operations)

### 7. Middleware Updated
- ✅ `auth.js` - Sequelize findByPk instead of findById

## 🔧 Next Steps - YOU MUST DO THESE

### Step 1: Install Dependencies
```powershell
cd "c:\Users\Ravindra Kandpal\Desktop\Expense-Management\backend"
npm install
```

### Step 2: Install and Setup PostgreSQL
1. **Download PostgreSQL:** https://www.postgresql.org/download/windows/
2. **Install PostgreSQL** (remember your password!)
3. **Create Database:**
```powershell
# Open psql command line
psql -U postgres

# In psql, run:
CREATE DATABASE expense_management;
\q
```

### Step 3: Update .env with Your PostgreSQL Credentials
Edit `.env` and update:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_management
```
Replace `YOUR_PASSWORD` with your PostgreSQL password.

### Step 4: Run Database Migrations
The database tables will be automatically created on first run due to `sequelize.sync()` in development mode. However, for production, you should create proper migrations:

```powershell
# Initialize Sequelize CLI
npx sequelize-cli init

# This will create migrations folder
# You can then create migrations for each table
npx sequelize-cli migration:generate --name create-all-tables
```

### Step 5: Create Initial Migration (Optional but Recommended)
Create a file `backend/migrations/YYYYMMDDHHMMSS-create-all-tables.js`:

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('Admin', 'Manager', 'Employee'),
        defaultValue: 'Employee'
      },
      companyId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      managerId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      isManagerApprover: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Companies table
    await queryInterface.createTable('Companies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      currency: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      adminUserId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Similar for Expenses, ApprovalRequests, ApprovalRules...
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('Companies');
    // Drop all tables...
  }
};
```

### Step 6: Start the Server
```powershell
npm run dev
```

## 🔄 Key Differences - MongoDB vs PostgreSQL

### Query Syntax Changes
| MongoDB (Mongoose) | PostgreSQL (Sequelize) |
|-------------------|------------------------|
| `Model.findById(id)` | `Model.findByPk(id)` |
| `Model.findOne({ field: value })` | `Model.findOne({ where: { field: value } })` |
| `Model.find({ field: value })` | `Model.findAll({ where: { field: value } })` |
| `.populate('field')` | `include: [{ model: Model, as: 'alias' }]` |
| `new Model({...})` then `.save()` | `Model.create({...})` |
| `model.field = value` then `.save()` | `model.update({ field: value })` |
| `.deleteMany()` | `.destroy()` |
| `$in`, `$gte`, `$lte` | `{ [Op.in]: [...] }`, `{ [Op.gte]: value }` |

### Field Name Changes
- `_id` → `id` (UUID instead of ObjectId)
- `employee` → `employeeId`
- `company` → `companyId`
- `manager` → `managerId`
- `approver` → `approverId`
- `expense` → `expenseId`
- `finalApprover` → `finalApproverId`
- `adminUser` → `adminUserId`

### Data Types
- ObjectId → UUID (Universally Unique Identifier)
- Embedded documents → JSONB (JSON Binary)
- Arrays → JSONB arrays
- Nested objects → JSONB

## 📋 Testing Checklist

After migration, test these features:

- [ ] User signup/login
- [ ] Create company
- [ ] Create users
- [ ] Create expenses
- [ ] Approval workflow
- [ ] Approval rules
- [ ] Currency conversion
- [ ] OCR receipt processing
- [ ] Expense filtering and pagination
- [ ] Role-based permissions

## ⚠️ Important Notes

1. **UUID vs ObjectId**: All IDs are now UUIDs instead of MongoDB ObjectIds
2. **JSONB**: Complex nested objects are stored as JSONB in PostgreSQL
3. **Transactions**: Use Sequelize transactions for multi-step operations
4. **Indexes**: Defined in model definitions and migrations
5. **Case Sensitivity**: PostgreSQL table names use PascalCase (Users, Companies, etc.)

## 🐛 Troubleshooting

### Connection Errors
- Ensure PostgreSQL service is running
- Check DATABASE_URL in .env
- Verify PostgreSQL is listening on port 5432

### Migration Errors
- Check PostgreSQL logs
- Ensure all required extensions are installed
- Verify user has proper permissions

### Query Errors
- Check field names (id not _id)
- Use `where` clause in findOne/findAll
- Import Op from sequelize for operators

## 📚 Additional Resources

- Sequelize Documentation: https://sequelize.org/docs/v6/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Sequelize CLI: https://github.com/sequelize/cli

---

**Migration completed successfully!** All files have been updated to use PostgreSQL with Sequelize.
