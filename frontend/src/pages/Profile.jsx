import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
import { useAuthStore } from '../store/authStore'
import { userAPI } from '../services/api'
import { handleApiError } from '../utils/helpers'
import { User, Lock } from 'lucide-react'
import Spinner from '../components/Spinner'

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm()

  const updateProfileMutation = useMutation(
    (data) => userAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        updateUser(response.data.data)
        toast.success('Profile updated successfully!')
      },
      onError: (error) => {
        toast.error(handleApiError(error))
      },
    }
  )

  const changePasswordMutation = useMutation(
    (data) => userAPI.changePassword(data),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!')
        resetPassword()
      },
      onError: (error) => {
        toast.error(handleApiError(error))
      },
    }
  )

  const onSubmitProfile = (data) => {
    updateProfileMutation.mutate(data)
  }

  const onSubmitPassword = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="inline mr-2" size={16} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className="inline mr-2" size={16} />
            Password
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                {...registerProfile('name', { required: 'Name is required' })}
                className="input-field"
              />
              {errorsProfile.name && (
                <p className="mt-1 text-sm text-red-600">{errorsProfile.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...registerProfile('email', { required: 'Email is required' })}
                className="input-field"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                className="input-field"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={user?.company?.name || ''}
                className="input-field"
                disabled
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isLoading}
              className="btn-primary"
            >
              {updateProfileMutation.isLoading ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Change Password</h3>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                {...registerPassword('currentPassword', {
                  required: 'Current password is required',
                })}
                className="input-field"
              />
              {errorsPassword.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errorsPassword.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="input-field"
              />
              {errorsPassword.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errorsPassword.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your password',
                })}
                className="input-field"
              />
              {errorsPassword.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errorsPassword.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isLoading}
              className="btn-primary"
            >
              {changePasswordMutation.isLoading ? <Spinner size="sm" /> : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Profile
