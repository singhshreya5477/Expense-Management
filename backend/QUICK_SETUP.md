# 🚀 Quick Setup Guide - PostgreSQL Backend

## Prerequisites
- Node.js installed
- PostgreSQL installed

## Setup Steps

### 1️⃣ Install PostgreSQL (if not installed)

**Windows:**
1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. Default port: 5432
4. **Remember your password!**

### 2️⃣ Create Database

Open PowerShell and run:
```powershell
# Login to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE expense_management;
\q
```

### 3️⃣ Configure Environment

Edit `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_management
JWT_SECRET=kandalravindraisworkinghereanddoingnothing
JWT_EXPIRE=30d
OPENAI_API_KEY=your_openai_key_here
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 4️⃣ Install Dependencies

```powershell
cd backend
npm install
```

This will install:
- sequelize
- pg
- pg-hstore
- sequelize-cli
- and all other dependencies

### 5️⃣ Start the Server

```powershell
npm run dev
```

The server will:
- Connect to PostgreSQL
- Auto-create all tables (in development mode)
- Start on port 5000

### 6️⃣ Verify Installation

Check the server logs for:
```
✓ PostgreSQL connected successfully
✓ Database synchronized
✓ Server running in development mode on port 5000
```

Test the health endpoint:
```powershell
curl http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123.45,
  "database": "connected"
}
```

## 🔧 Troubleshooting

### PostgreSQL Connection Error
**Error:** `connect ECONNREFUSED`

**Fix:**
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Check password is correct

### Database Not Found
**Error:** `database "expense_management" does not exist`

**Fix:**
```powershell
psql -U postgres
CREATE DATABASE expense_management;
\q
```

### Permission Denied
**Error:** `password authentication failed`

**Fix:**
- Check password in DATABASE_URL
- Reset PostgreSQL password if needed

### Module Not Found
**Error:** `Cannot find module 'sequelize'`

**Fix:**
```powershell
npm install
```

## 📋 Test the API

### Register a Company
```powershell
curl -X POST http://localhost:5000/api/auth/signup `
-H "Content-Type: application/json" `
-d '{
  "email": "admin@company.com",
  "password": "password123",
  "name": "Admin User",
  "companyName": "My Company",
  "country": "United States"
}'
```

### Login
```powershell
curl -X POST http://localhost:5000/api/auth/login `
-H "Content-Type: application/json" `
-d '{
  "email": "admin@company.com",
  "password": "password123"
}'
```

## 📊 Database Management

### View Tables
```powershell
psql -U postgres -d expense_management
\dt
```

### View Table Structure
```sql
\d "Users"
\d "Companies"
\d "Expenses"
```

### View Data
```sql
SELECT * FROM "Users";
SELECT * FROM "Companies";
```

### Clear Data (Development Only!)
```sql
TRUNCATE TABLE "Users", "Companies", "Expenses", "ApprovalRequests", "ApprovalRules" CASCADE;
```

## 🎯 API Endpoints

All endpoints remain the same:

### Auth
- POST `/api/auth/signup` - Register company
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout

### Users
- GET `/api/users` - List users
- POST `/api/users` - Create user
- GET `/api/users/:id` - Get user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Expenses
- GET `/api/expenses` - List expenses
- POST `/api/expenses` - Create expense
- GET `/api/expenses/:id` - Get expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense

### Approvals
- GET `/api/approvals/pending` - Pending approvals
- POST `/api/approvals/:requestId/approve` - Approve
- POST `/api/approvals/:requestId/reject` - Reject

### Companies
- GET `/api/companies/my` - Get my company
- PUT `/api/companies/my` - Update company
- GET `/api/companies/currencies` - List currencies

### Approval Rules
- GET `/api/approval-rules` - List rules
- POST `/api/approval-rules` - Create rule
- GET `/api/approval-rules/:id` - Get rule
- PUT `/api/approval-rules/:id` - Update rule
- DELETE `/api/approval-rules/:id` - Delete rule

## ✅ All Set!

Your backend is now running on PostgreSQL! 🎉

For more details, see:
- `MIGRATION_GUIDE.md` - Technical details
- `MIGRATION_COMPLETE.md` - Complete summary
