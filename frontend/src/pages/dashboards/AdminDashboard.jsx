import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { expenseAPI, approvalAPI, userAPI, companyAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { 
  Users, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  Building2,
  CheckSquare,
  Receipt,
  Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const { data: usersData, isLoading: usersLoading } = useQuery('users', () => userAPI.getUsers());
  const { data: expensesData, isLoading: expensesLoading } = useQuery('all-expenses', () => 
    expenseAPI.getExpenses()
  );
  const { data: approvalsData, isLoading: approvalsLoading } = useQuery('pending-approvals', () =>
    approvalAPI.getPending()
  );
  const { data: rulesData } = useQuery('approval-rules', () => approvalAPI.getRules());

  const users = usersData?.data?.data || [];
  const expenses = expensesData?.expenses || [];
  const approvals = approvalsData?.approvals || [];
  const rules = rulesData?.rules || [];

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
      link: '/users',
    },
    {
      title: 'Total Expenses',
      value: expenses.length,
      icon: Receipt,
      color: 'bg-purple-500',
      link: '/expenses',
    },
    {
      title: 'Pending Approvals',
      value: approvals.length,
      icon: CheckSquare,
      color: 'bg-yellow-500',
      link: '/approvals',
    },
    {
      title: 'Approval Rules',
      value: rules.length,
      icon: Settings,
      color: 'bg-green-500',
      link: '/approval-rules',
    },
  ];

  const roleStats = [
    { role: 'Admin', count: users.filter(u => u.role === 'Admin').length, color: 'text-purple-600 bg-purple-100' },
    { role: 'Manager', count: users.filter(u => u.role === 'Manager').length, color: 'text-blue-600 bg-blue-100' },
    { role: 'Employee', count: users.filter(u => u.role === 'Employee').length, color: 'text-green-600 bg-green-100' },
  ];

  const expenseStats = [
    { status: 'Pending', count: expenses.filter(e => e.status === 'Pending').length, color: 'text-yellow-600 bg-yellow-100' },
    { status: 'In Progress', count: expenses.filter(e => e.status === 'In Progress').length, color: 'text-blue-600 bg-blue-100' },
    { status: 'Approved', count: expenses.filter(e => e.status === 'Approved').length, color: 'text-green-600 bg-green-100' },
    { status: 'Rejected', count: expenses.filter(e => e.status === 'Rejected').length, color: 'text-red-600 bg-red-100' },
  ];

  if (usersLoading || expensesLoading || approvalsLoading) {
    return <Spinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Shield className="text-purple-600" size={32} />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage your organization's expense management system</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/users" className="btn-primary">
            <Users size={20} className="mr-2" />
            Manage Users
          </Link>
          <Link to="/approval-rules" className="btn-secondary">
            <Settings size={20} className="mr-2" />
            Configure Rules
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Organization Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users size={20} className="mr-2 text-blue-600" />
            User Roles Distribution
          </h2>
          <div className="space-y-4">
            {roleStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center font-bold text-lg`}>
                    {stat.count}
                  </div>
                  <span className="font-medium text-gray-700">{stat.role}s</span>
                </div>
                <div className="text-sm text-gray-500">
                  {users.length > 0 ? Math.round((stat.count / users.length) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Status Overview */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Receipt size={20} className="mr-2 text-purple-600" />
            Expense Status Overview
          </h2>
          <div className="space-y-4">
            {expenseStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center font-bold text-lg`}>
                    {stat.count}
                  </div>
                  <span className="font-medium text-gray-700">{stat.status}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {expenses.length > 0 ? Math.round((stat.count / expenses.length) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
            <Link to="/expenses" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
                  <p className="text-xs text-gray-500">{expense.User?.name} • {formatDate(expense.date)}</p>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                  <StatusBadge status={expense.status} />
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-gray-500 py-8">No expenses yet</p>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            <Link to="/approvals" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {approvals.slice(0, 5).map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {approval.Expense?.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {approval.Expense?.User?.name} • Step {approval.stepNumber}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(approval.Expense?.amount, approval.Expense?.currency)}
                  </span>
                </div>
              </div>
            ))}
            {approvals.length === 0 && (
              <p className="text-center text-gray-500 py-8">No pending approvals</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/users"
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center"
          >
            <Users className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-sm font-medium text-gray-900">Add User</p>
          </Link>
          <Link
            to="/approval-rules"
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center"
          >
            <Settings className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-sm font-medium text-gray-900">Create Rule</p>
          </Link>
          <Link
            to="/expenses"
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center"
          >
            <Receipt className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm font-medium text-gray-900">View Expenses</p>
          </Link>
          <Link
            to="/approvals"
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center"
          >
            <CheckSquare className="mx-auto mb-2 text-yellow-600" size={24} />
            <p className="text-sm font-medium text-gray-900">Approvals</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
