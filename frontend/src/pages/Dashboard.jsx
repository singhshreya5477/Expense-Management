import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { expenseAPI, approvalAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Receipt, CheckSquare, DollarSign, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();

  const { data: expenses, isLoading: expensesLoading } = useQuery(
    'my-expenses',
    () => expenseAPI.getMyExpenses({ limit: 5 })
  );

  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery(
    'pending-approvals',
    () => approvalAPI.getPending({ limit: 5 }),
    { enabled: user?.role === 'Admin' || user?.role === 'Manager' }
  );

  const stats = [
    {
      title: 'Total Expenses',
      value: expenses?.expenses?.length || 0,
      icon: Receipt,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Approval',
      value: expenses?.expenses?.filter(e => e.status === 'Pending')?.length || 0,
      icon: CheckSquare,
      color: 'bg-yellow-500',
    },
    {
      title: 'Approved',
      value: expenses?.expenses?.filter(e => e.status === 'Approved')?.length || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Total Amount',
      value: formatCurrency(
        expenses?.expenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0
      ),
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ];

  if (expensesLoading) {
    return <Spinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/expenses/create" className="btn-primary">
          + New Expense
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="card-header">Recent Expenses</h2>
          <Link to="/expenses" className="text-blue-600 hover:text-blue-700 font-medium">
            View All
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Description</th>
                <th className="table-header-cell">Category</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {expenses?.expenses?.slice(0, 5).map((expense) => (
                <tr key={expense.id}>
                  <td className="table-cell">{formatDate(expense.date)}</td>
                  <td className="table-cell">{expense.description}</td>
                  <td className="table-cell">{expense.category}</td>
                  <td className="table-cell">{formatCurrency(expense.amount, expense.currency)}</td>
                  <td className="table-cell">
                    <StatusBadge status={expense.status} />
                  </td>
                </tr>
              ))}
              {(!expenses?.expenses || expenses.expenses.length === 0) && (
                <tr>
                  <td colSpan="5" className="table-cell text-center text-gray-500">
                    No expenses found. Create your first expense!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Approvals (Manager/Admin only) */}
      {(user?.role === 'Admin' || user?.role === 'Manager') && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-header">Pending Approvals</h2>
            <Link to="/approvals" className="text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>

          {approvalsLoading ? (
            <Spinner size="md" />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Employee</th>
                    <th className="table-header-cell">Description</th>
                    <th className="table-header-cell">Amount</th>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {pendingApprovals?.approvals?.slice(0, 5).map((approval) => (
                    <tr key={approval.id}>
                      <td className="table-cell">{approval.Expense?.User?.name}</td>
                      <td className="table-cell">{approval.Expense?.description}</td>
                      <td className="table-cell">
                        {formatCurrency(approval.Expense?.amount, approval.Expense?.currency)}
                      </td>
                      <td className="table-cell">{formatDate(approval.Expense?.date)}</td>
                      <td className="table-cell">
                        <Link
                          to={`/approvals/${approval.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!pendingApprovals?.approvals || pendingApprovals.approvals.length === 0) && (
                    <tr>
                      <td colSpan="5" className="table-cell text-center text-gray-500">
                        No pending approvals
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
