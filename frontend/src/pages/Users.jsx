import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { userAPI } from '../services/api'
import { Users as UsersIcon, UserPlus, Edit2, Trash2, Shield } from 'lucide-react'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import { ROLES } from '../utils/constants'
import useAuthStore from '../store/authStore'

const Users = () => {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.EMPLOYEE,
    managerId: '',
    isManagerApprover: false,
  })

  const { data, isLoading } = useQuery('users', () => userAPI.getUsers())
  const users = data?.data?.data || []
  const managers = users.filter(u => u.role === ROLES.MANAGER || u.role === ROLES.ADMIN)

  // Create user mutation
  const createMutation = useMutation(
    (data) => userAPI.createUser(data),
    {
      onSuccess: () => {
        toast.success('User created successfully!')
        queryClient.invalidateQueries('users')
        handleCloseModal()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create user')
      },
    }
  )

  // Update role mutation
  const updateRoleMutation = useMutation(
    ({ userId, data }) => userAPI.updateRole(userId, data),
    {
      onSuccess: () => {
        toast.success('User role updated successfully!')
        queryClient.invalidateQueries('users')
        handleCloseModal()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update user role')
      },
    }
  )

  // Delete user mutation
  const deleteMutation = useMutation(
    (userId) => userAPI.deleteUser(userId),
    {
      onSuccess: () => {
        toast.success('User deleted successfully!')
        queryClient.invalidateQueries('users')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete user')
      },
    }
  )

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        managerId: user.managerId || '',
        isManagerApprover: user.isManagerApprover || false,
      })
    } else {
      setSelectedUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: ROLES.EMPLOYEE,
        managerId: '',
        isManagerApprover: false,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: ROLES.EMPLOYEE,
      managerId: '',
      isManagerApprover: false,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (selectedUser) {
      // Update user role
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        data: {
          role: formData.role,
          managerId: formData.managerId || null,
          isManagerApprover: formData.isManagerApprover,
        },
      })
    } else {
      // Create new user
      if (!formData.password || formData.password.length < 8) {
        toast.error('Password must be at least 8 characters')
        return
      }
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'bg-purple-100 text-purple-800'
      case ROLES.MANAGER:
        return 'bg-blue-100 text-blue-800'
      case ROLES.EMPLOYEE:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <Spinner size="lg" className="mt-20" />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Create and manage employees & managers</p>
        </div>
        {currentUser?.role === ROLES.ADMIN && (
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Add User</span>
          </button>
        )}
      </div>

      <div className="card">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {currentUser?.role === ROLES.ADMIN && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.Manager?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.isManagerApprover ? (
                        <span className="flex items-center text-green-600">
                          <Shield size={16} className="mr-1" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {currentUser?.role === ROLES.ADMIN && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="Edit Role"
                          >
                            <Edit2 size={16} />
                          </button>
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedUser ? 'Update User Role' : 'Create New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!selectedUser && (
            <>
              <div>
                <label className="input-label">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="input-label">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="input-label">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                />
              </div>
            </>
          )}

          <div>
            <label className="input-label">
              Role <span className="text-red-600">*</span>
            </label>
            <select
              required
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value={ROLES.EMPLOYEE}>Employee</option>
              <option value={ROLES.MANAGER}>Manager</option>
              {currentUser?.role === ROLES.ADMIN && <option value={ROLES.ADMIN}>Admin</option>}
            </select>
          </div>

          {(formData.role === ROLES.EMPLOYEE || formData.role === ROLES.MANAGER) && (
            <div>
              <label className="input-label">Assign Manager (Optional)</label>
              <select
                className="input-field"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              >
                <option value="">No Manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.role === ROLES.MANAGER && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isManagerApprover"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.isManagerApprover}
                onChange={(e) =>
                  setFormData({ ...formData, isManagerApprover: e.target.checked })
                }
              />
              <label htmlFor="isManagerApprover" className="ml-2 block text-sm text-gray-700">
                Is Manager Approver (Approve before other approval rules)
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateRoleMutation.isLoading}
              className="btn-primary"
            >
              {createMutation.isLoading || updateRoleMutation.isLoading ? (
                <Spinner size="sm" />
              ) : selectedUser ? (
                'Update Role'
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users
