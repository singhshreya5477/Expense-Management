import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { expenseAPI } from '../services/api';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Search, Filter, Plus } from 'lucide-react';

const Expenses = () => {
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });

  const { data, isLoading } = useQuery(['expenses', filters], () =>
    expenseAPI.getMyExpenses(filters)
  );

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <Spinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
        <Link to="/expenses/create" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>New Expense</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="search"
              placeholder="Search expenses..."
              className="input-field pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <select
            name="status"
            className="input-field"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            name="category"
            className="input-field"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Meals">Meals</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Transportation">Transportation</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Training">Training</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Description</th>
                <th className="table-header-cell">Category</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {data?.expenses?.map((expense) => (
                <tr key={expense.id}>
                  <td className="table-cell">{formatDate(expense.date)}</td>
                  <td className="table-cell">
                    <div className="max-w-xs truncate">{expense.description}</div>
                  </td>
                  <td className="table-cell">{expense.category}</td>
                  <td className="table-cell font-medium">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={expense.status} />
                  </td>
                  <td className="table-cell">
                    <Link
                      to={`/expenses/${expense.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {(!data?.expenses || data.expenses.length === 0) && (
                <tr>
                  <td colSpan="6" className="table-cell text-center text-gray-500 py-8">
                    No expenses found
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

export default Expenses;
