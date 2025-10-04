# Expense Management System - Backend

A comprehensive, production-ready expense management backend built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & User Management**
  - Auto-creates company and admin on first signup
  - Role-based access control (Admin, Manager, Employee)
  - JWT-based authentication with HTTP-only cookies
  - Password strength validation

- **Expense Submission**
  - Multi-currency support with automatic conversion
  - OCR for receipt scanning
  - Expense history tracking with pagination
  - Field validation

- **Approval Workflow**
  - Sequential approvals
  - Conditional approval rules (percentage, specific approver, hybrid)
  - Manager approval integration
  - Multi-step approval process

- **Security**
  - Helmet.js for security headers
  - Rate limiting
  - XSS protection
  - NoSQL injection prevention
  - Parameter pollution prevention

- **Performance**
  - Response compression
  - Currency conversion caching
  - Database query optimization
  - Connection pooling

- **Monitoring & Logging**
  - Winston logger
  - Error tracking
  - Request logging
  - Health check endpoint

## 📋 Prerequisites

- Node.js >= 14.x
- MongoDB >= 4.x
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

## ⚙️ Configuration

Edit `.env` file with your settings:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-management
JWT_SECRET=your_secret_key_min_32_characters
OPENAI_API_KEY=your_openai_key (optional)
```

## 🚀 Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new company and admin
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Users (Admin only)
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/manager` - Assign manager
- `DELETE /api/users/:id` - Delete user

### Expenses
- `POST /api/expenses` - Submit expense
- `GET /api/expenses` - Get expenses (with filters & pagination)
- `GET /api/expenses/my-expenses` - Get user's expenses
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Approvals (Manager/Admin)
- `GET /api/approvals/pending` - Get pending approvals
- `POST /api/approvals/:requestId/approve` - Approve expense
- `POST /api/approvals/:requestId/reject` - Reject expense

### Approval Rules (Admin)
- `POST /api/approval-rules` - Create approval rule
- `GET /api/approval-rules` - Get all rules
- `GET /api/approval-rules/:id` - Get rule
- `PUT /api/approval-rules/:id` - Update rule
- `DELETE /api/approval-rules/:id` - Delete rule

### OCR
- `POST /api/ocr/scan-receipt` - Scan receipt (20/hour limit)

### Company
- `GET /api/companies/currencies` - Get all currencies
- `GET /api/companies/my-company` - Get company info
- `PUT /api/companies/my-company` - Update company

### Health Check
- `GET /health` - Server health status

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Express-validator
- **XSS Protection** - Clean user input
- **NoSQL Injection Prevention** - Mongo sanitization
- **Password Hashing** - Bcrypt
- **JWT Authentication** - Secure tokens

## 📊 Database Models

- **User** - User information with roles
- **Company** - Company details with currency
- **Expense** - Expense claims with multi-currency
- **ApprovalRule** - Workflow rules configuration
- **ApprovalRequest** - Individual approval requests

## 📁 Project Structure

