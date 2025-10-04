import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userAPI, expenseAPI, approvalAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { 
  User, 
  Mail, 
  Briefcase, 
  Key, 
  Save,
  Users,
  CheckSquare,
  TrendingUp,
  Award,
  Target,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ManagerProfile = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: profileData, isLoading: profileLoading } = useQuery('manager-profile', () =>
    userAPI.getProfile()
  );

  const { data: myExpensesData } = useQuery('my-expenses', () =>
    expenseAPI.getMyExpenses()
  );

  const { data: approvalsData } = useQuery('my-approvals', () =>
    approvalAPI.getPending()
  );

  const updateProfileMutation = useMutation(
    (data) => userAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        toast.success('Profile updated successfully');
        setUser(response.data.data);
        setIsEditing(false);
        queryClient.invalidateQueries('manager-profile');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      },
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  const myExpenses = myExpensesData?.expenses || [];
  const approvals = approvalsData?.approvals || [];

  const stats = [
    {
      label: 'My Expenses',
      value: myExpenses.length,
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Approvals',
      value: approvals.filter(a => a.status === 'Pending').length,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Approved',
      value: approvals.filter(a => a.status === 'Approved').length,
      icon: CheckSquare,
      color: 'bg-green-500',
    },
  ];

  if (profileLoading) {
    return <Spinner size="lg" className="mt-20" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Briefcase className="text-blue-600" size={32} />
            <span>Manager Profile</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage your account and view your activity</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            <User size={20} className="mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <User className="text-white" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <div className="mt-2 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center space-x-2">
                <Briefcase size={16} />
                <span>Manager</span>
              </div>
              <p className="text-gray-600 mt-3">{user?.email}</p>
              
              {user?.isManagerApprover && (
                <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Award size={14} />
                  <span>Approver</span>
                </div>
              )}

              <div className="w-full mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member since</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">User ID</span>
                    <span className="text-sm font-semibold text-gray-900">#{user?.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
            <div className="space-y-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`${stat.color} p-2 rounded-lg`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{stat.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profile Information & Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User size={20} className="mr-2 text-blue-600" />
              Account Information
            </h3>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Key size={16} className="mr-2" />
                    Change Password (Optional)
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary flex-1"
                  >
                    <Save size={20} className="mr-2" />
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="text-gray-600 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="text-base font-semibold text-gray-900">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="text-gray-600 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-base font-semibold text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="text-gray-600 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Role</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-base font-semibold text-gray-900">Manager</p>
                      {user?.isManagerApprover && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Approver
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manager Responsibilities */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target size={20} className="mr-2 text-blue-600" />
              Manager Responsibilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Approve Expenses</p>
                    <p className="text-xs text-gray-600">Review team submissions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Team Oversight</p>
                    <p className="text-xs text-gray-600">Monitor team expenses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Personal Expenses */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Expenses</h3>
            <div className="space-y-3">
              {myExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600">{formatDate(expense.date)} • {expense.category}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                    <StatusBadge status={expense.status} />
                  </div>
                </div>
              ))}
              {myExpenses.length === 0 && (
                <p className="text-center text-gray-500 py-8">No expenses yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;
