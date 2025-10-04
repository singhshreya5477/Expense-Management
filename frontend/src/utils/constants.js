export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
};

export const EXPENSE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  IN_PROGRESS: 'In Progress',
};

export const APPROVAL_TYPES = {
  PERCENTAGE: 'percentage',
  SPECIFIC_APPROVER: 'specific_approver',
  HYBRID: 'hybrid',
};

export const EXPENSE_CATEGORIES = [
  'Travel',
  'Meals',
  'Accommodation',
  'Transportation',
  'Office Supplies',
  'Training',
  'Entertainment',
  'Other',
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export const STATUS_COLORS = {
  Pending: 'badge-pending',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  'In Progress': 'badge-in-progress',
};
