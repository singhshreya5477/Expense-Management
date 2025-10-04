# Quick Setup Guide - PostgreSQL Migration

## 🚀 Quick Start

### 1. Install PostgreSQL

**Windows:**
```powershell
# Download and install from:
https://www.postgresql.org/download/windows/

# During installation:
# - Set password for postgres user (remember this!)
# - Port: 5432 (default)
# - Locale: Default
```

### 2. Create Database

```powershell
# Open Command Prompt or PowerShell
psql -U postgres

# Enter your postgres password, then run:
CREATE DATABASE expense_management;

# Check it was created:
\l

# Exit:
\q
```

### 3. Update Environment Variables

Edit `.env` file:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_management
JWT_SECRET=your_very_secure_jwt_secret_change_this_in_production
JWT_EXPIRE=30d
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

**Replace `YOUR_PASSWORD` with your actual PostgreSQL password!**

### 4. Install Dependencies

```powershell
cd backend
npm install
```

### 5. Run the Application

```powershell
npm run dev
```

The server will start on http://localhost:5000

On first run, Sequelize will automatically create all database tables!

## ✅ Verification

### Check Database Tables

```powershell
psql -U postgres -d expense_management

# List all tables:
\dt

# You should see:
# - Users
# - Companies
# - Expenses
# - ApprovalRequests
# - ApprovalRules
```

### Test API Endpoints

```powershell
# Health check
curl http://localhost:5000/health

# Should return:
# {"success":true,"status":"healthy","database":"connected"}
```

## 🔧 Common Issues

### Issue 1: "password authentication failed"
**Solution:** Check your DATABASE_URL in `.env` has the correct password

### Issue 2: "database does not exist"
**Solution:** Run `CREATE DATABASE expense_management;` in psql

### Issue 3: "connect ECONNREFUSED"
**Solution:** Ensure PostgreSQL service is running:
```powershell
# Check if running:
Get-Service -Name postgresql*

# Start if stopped:
Start-Service postgresql-x64-16  # or your version
```

### Issue 4: Port 5432 already in use
**Solution:** Change port in PostgreSQL config or in DATABASE_URL

## 📊 Database Schema

### Tables Created:
1. **Users** - User accounts and authentication
2. **Companies** - Company information
3. **Expenses** - Expense records
4. **ApprovalRequests** - Approval workflow
5. **ApprovalRules** - Approval rule configuration

### Key Changes from MongoDB:
- `_id` → `id` (UUID)
- Nested objects → JSONB fields
- ObjectId references → UUID foreign keys
- All timestamps: `createdAt`, `updatedAt`

## 🎯 Next Steps

1. Test user registration: POST `/api/auth/signup`
2. Test login: POST `/api/auth/login`
3. Create expenses: POST `/api/expenses`
4. Test approval workflow

## 📝 Additional Commands

```powershell
# View server logs
npm run dev

# Run in production mode
npm start

# Check PostgreSQL version
psql --version

# Backup database
pg_dump -U postgres expense_management > backup.sql

# Restore database
psql -U postgres expense_management < backup.sql
```

## 🆘 Need Help?

Check the detailed `MIGRATION_GUIDE.md` for:
- Complete list of changes
- Query syntax differences
- Testing checklist
- Troubleshooting guide

---

**Database migration completed!** You're now running on PostgreSQL 🐘
