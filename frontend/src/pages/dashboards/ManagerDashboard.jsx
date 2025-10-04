import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { expenseAPI, approvalAPI, userAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { 
  CheckSquare, 
  Users, 
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase
} from 'lucide-react';

const ManagerDashboard = () => {
  const { data: myExpensesData, isLoading: myExpensesLoading } = useQuery('my-expenses', () =>
    expenseAPI.getMyExpenses()
  );
  const { data: teamExpensesData, isLoading: teamExpensesLoading } = useQuery('team-expenses', () =>
    expenseAPI.getExpenses()
  );
  const { data: approvalsData, isLoading: approvalsLoading } = useQuery('pending-approvals', () =>
    approvalAPI.getPending()
  );
  const { data: teamMembersData } = useQuery('team-members', () => userAPI.getUsers());

  const myExpenses = myExpensesData?.expenses || [];
  const teamExpenses = teamExpensesData?.expenses || [];
  const approvals = approvalsData?.approvals || [];
  const teamMembers = teamMembersData?.data?.data || [];

  const stats = [
    {
      title: 'Pending Approvals',
      value: approvals.length,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/approvals',
    },
    {
      title: 'My Expenses',
      value: myExpenses.length,
      icon: Receipt,
      color: 'bg-blue-500',
      link: '/expenses',
    },
    {
      title: 'Team Expenses',
      value: teamExpenses.length,
      icon: Users,
      color: 'bg-purple-500',
      link: '/expenses',
    },
    {
      title: 'Total Approved',
      value: teamExpenses.filter(e => e.status === 'Approved').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/expenses',
    },
  ];

  const approvalStats = [
    { 
      status: 'Pending', 
      count: approvals.filter(a => a.status === 'Pending').length, 
      color: 'text-yellow-600 bg-yellow-100',
      icon: Clock
    },
    { 
      status: 'Approved', 
      count: approvals.filter(a => a.status === 'Approved').length, 
      color: 'text-green-600 bg-green-100',
      icon: CheckCircle
    },
    { 
      status: 'Rejected', 
      count: approvals.filter(a => a.status === 'Rejected').length, 
      color: 'text-red-600 bg-red-100',
      icon: XCircle
    },
  ];

  if (myExpensesLoading || teamExpensesLoading || approvalsLoading) {
    return <Spinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Briefcase className="text-blue-600" size={32} />
            <span>Manager Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage approvals and oversee team expenses</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/approvals" className="btn-primary">
            <CheckSquare size={20} className="mr-2" />
            Pending Approvals ({approvals.length})
          </Link>
          <Link to="/expenses/create" className="btn-secondary">
            <Receipt size={20} className="mr-2" />
            New Expense
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

      {/* Approval Status Overview */}
      <div className="card bg-gradient-to-br from-yellow-50 to-orange-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckSquare size={20} className="mr-2 text-yellow-600" />
          Your Approval Activity
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {approvalStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                    <p className="text-sm text-gray-600">{stat.status}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock size={20} className="mr-2 text-yellow-600" />
              Pending Approvals
            </h2>
            <Link to="/approvals" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {approvals.filter(a => a.status === 'Pending').slice(0, 5).map((approval) => (
              <div key={approval.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900">{approval.Expense?.User?.name}</p>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Step {approval.stepNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{approval.Expense?.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatDate(approval.Expense?.date)}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(approval.Expense?.amount, approval.Expense?.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {approvals.filter(a => a.status === 'Pending').length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">All caught up! No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Expenses */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users size={20} className="mr-2 text-purple-600" />
              Team Expenses
            </h2>
            <Link to="/expenses" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {teamExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">{expense.User?.name}</p>
                    <StatusBadge status={expense.status} />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{expense.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(expense.date)}</p>
                </div>
                <div className="ml-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                </div>
              </div>
            ))}
            {teamExpenses.length === 0 && (
              <p className="text-center text-gray-500 py-8">No team expenses yet</p>
            )}
          </div>
        </div>
      </div>

      {/* My Recent Expenses */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Receipt size={20} className="mr-2 text-blue-600" />
            My Recent Expenses
          </h2>
          <Link to="/expenses" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myExpenses.slice(0, 5).map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(expense.date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={expense.status} />
                  </td>
                </tr>
              ))}
              {myExpenses.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No expenses found. Create your first expense!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
