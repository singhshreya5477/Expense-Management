import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { expenseAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { 
  Receipt, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Wallet
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { data: expensesData, isLoading } = useQuery('my-expenses', () =>
    expenseAPI.getMyExpenses()
  );

  const expenses = expensesData?.expenses || [];

  const statusCounts = {
    pending: expenses.filter(e => e.status === 'Pending').length,
    inProgress: expenses.filter(e => e.status === 'In Progress').length,
    approved: expenses.filter(e => e.status === 'Approved').length,
    rejected: expenses.filter(e => e.status === 'Rejected').length,
  };

  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const approvedAmount = expenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const stats = [
    {
      title: 'Total Expenses',
      value: expenses.length,
      icon: Receipt,
      color: 'bg-green-500',
      link: '/expenses',
    },
    {
      title: 'Pending',
      value: statusCounts.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/expenses',
    },
    {
      title: 'Approved',
      value: statusCounts.approved,
      icon: CheckCircle,
      color: 'bg-blue-500',
      link: '/expenses',
    },
    {
      title: 'Total Amount',
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      color: 'bg-purple-500',
      link: '/expenses',
    },
  ];

  const statusBreakdown = [
    { 
      status: 'Pending', 
      count: statusCounts.pending, 
      percentage: expenses.length > 0 ? ((statusCounts.pending / expenses.length) * 100).toFixed(0) : 0,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-100',
      icon: Clock
    },
    { 
      status: 'In Progress', 
      count: statusCounts.inProgress, 
      percentage: expenses.length > 0 ? ((statusCounts.inProgress / expenses.length) * 100).toFixed(0) : 0,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-100',
      icon: TrendingUp
    },
    { 
      status: 'Approved', 
      count: statusCounts.approved, 
      percentage: expenses.length > 0 ? ((statusCounts.approved / expenses.length) * 100).toFixed(0) : 0,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-100',
      icon: CheckCircle
    },
    { 
      status: 'Rejected', 
      count: statusCounts.rejected, 
      percentage: expenses.length > 0 ? ((statusCounts.rejected / expenses.length) * 100).toFixed(0) : 0,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-100',
      icon: XCircle
    },
  ];

  if (isLoading) {
    return <Spinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Wallet className="text-green-600" size={32} />
            <span>My Expenses</span>
          </h1>
          <p className="text-gray-600 mt-1">Track and manage your expense submissions</p>
        </div>
        <Link to="/expenses/create" className="btn-primary">
          <Plus size={20} className="mr-2" />
          Submit New Expense
        </Link>
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

      {/* Financial Summary */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign size={20} className="mr-2 text-green-600" />
          Financial Summary
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Submitted</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Approved Amount</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(approvedAmount)}</p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText size={20} className="mr-2 text-gray-600" />
          Expense Status Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusBreakdown.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className={`p-4 rounded-lg ${item.bgLight} border border-gray-200`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${item.textColor} uppercase`}>{item.status}</span>
                  <Icon className={item.textColor} size={18} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{item.count}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{item.percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Receipt size={20} className="mr-2 text-green-600" />
            Recent Expenses
          </h2>
          <Link to="/expenses" className="text-green-600 hover:text-green-700 font-medium text-sm">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.slice(0, 10).map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(expense.date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.merchant || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={expense.status} />
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 mb-2">No expenses yet</p>
                    <Link to="/expenses/create" className="text-green-600 hover:text-green-700 font-medium">
                      Create your first expense →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-br from-green-50 to-teal-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/expenses/create"
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Plus size={24} />
            </div>
            <p className="font-medium text-gray-900">New Expense</p>
            <p className="text-sm text-gray-600 mt-1">Submit a new expense</p>
          </Link>
          <Link
            to="/expenses"
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Receipt size={24} />
            </div>
            <p className="font-medium text-gray-900">View All</p>
            <p className="text-sm text-gray-600 mt-1">See all expenses</p>
          </Link>
          <div className="p-6 bg-white rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} />
            </div>
            <p className="font-medium text-gray-900">{statusCounts.inProgress}</p>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
