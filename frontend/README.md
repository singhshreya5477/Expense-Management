# Expense Management System - Frontend

Modern React-based frontend application for the Expense Management System.

## Features

- 🔐 **Authentication & Authorization**: Secure login and role-based access control
- 💰 **Expense Management**: Create, view, and track expenses with OCR receipt scanning
- ✅ **Approval Workflow**: Multi-level approval system with sequential and conditional rules
- 📊 **Dashboard**: Real-time analytics and expense insights
- 👥 **User Management**: Admin interface for managing users and companies
- 📱 **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- 🎨 **Modern UI/UX**: Clean, intuitive interface with smooth animations

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   ├── StatusBadge.jsx
│   │   └── Table.jsx
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Expenses.jsx
│   │   ├── CreateExpense.jsx
│   │   ├── ExpenseDetail.jsx
│   │   ├── Approvals.jsx
│   │   ├── ApprovalRules.jsx
│   │   ├── Users.jsx
│   │   ├── Companies.jsx
│   │   └── Profile.jsx
│   ├── services/       # API service layer
│   │   └── api.js
│   ├── store/          # State management
│   │   └── authStore.js
│   ├── utils/          # Helper functions and constants
│   │   ├── api.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx         # Main app component with routes
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features Overview

### User Roles

- **Employee**: Create and submit expenses, view own expenses
- **Manager**: All employee features + approve/reject expenses
- **Admin**: All features + manage users, companies, and approval rules

### Expense Management

- Create expenses with detailed information
- Upload and scan receipts using OCR
- Add expense line items
- Track expense status (Pending, Approved, Rejected, In Progress)
- View expense history and comments

### Approval Workflow

- Sequential approval chains
- Conditional approval rules based on amount thresholds
- Manager-based approvals
- Comment and feedback system
- Approval history tracking

### Dashboard

- Expense statistics and summaries
- Visual charts (Pie chart for categories, Bar chart for amounts)
- Recent expenses overview
- Pending approvals (for managers/admins)

## Environment Variables

The frontend uses the following proxy configuration in `vite.config.js`:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
}
```

## API Integration

All API calls are centralized in `src/services/api.js` with the following modules:

- `authAPI` - Authentication endpoints
- `userAPI` - User management
- `companyAPI` - Company management
- `expenseAPI` - Expense operations
- `approvalAPI` - Approval workflows
- `approvalRuleAPI` - Approval rule configuration
- `ocrAPI` - Receipt OCR processing

## State Management

- **Authentication State**: Managed by Zustand with localStorage persistence
- **Server State**: Managed by React Query with caching and automatic refetching
- **Form State**: Managed by React Hook Form

## Styling

The application uses Tailwind CSS with custom utility classes defined in `index.css`:

- `.btn-primary`, `.btn-secondary`, `.btn-danger` - Button styles
- `.input-field` - Input field styles
- `.card` - Card container styles
- `.badge-*` - Status badge styles

## Development

### Code Style

- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic

### Performance Optimization

- React Query for caching and request deduplication
- Lazy loading for routes (can be added)
- Optimized images and assets
- Vite's built-in code splitting

## Contributing

1. Follow the existing code structure
2. Write clean, documented code
3. Test thoroughly before committing
4. Update documentation as needed

## License

Proprietary - All rights reserved
