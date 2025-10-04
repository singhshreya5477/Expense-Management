import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { approvalAPI, userAPI } from '../services/api'
import { 
  GitBranch, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import ApprovalRuleForm from '../components/ApprovalRuleForm'
import { ROLES } from '../utils/constants'
import useAuthStore from '../store/authStore'

const ApprovalRules = () => {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'Sequential',
    amountThreshold: { min: 0, max: null },
    categories: [],
    steps: [{ stepNumber: 1, approvers: [] }],
    conditionalRules: {
      percentageRule: { enabled: false, percentage: 0 },
      specificApproverRule: { enabled: false, approvers: [] },
      hybridRule: { enabled: false, operator: 'AND' },
    },
  })

  const { data: rulesData, isLoading: rulesLoading } = useQuery('approval-rules', () =>
    approvalAPI.getRules()
  )
  const { data: usersData } = useQuery('users', () => userAPI.getUsers())

  const rules = rulesData?.rules || []
  const users = usersData?.data?.data || []
  const approvers = users.filter(u => u.role === ROLES.MANAGER || u.role === ROLES.ADMIN)

  // Create rule mutation
  const createMutation = useMutation((data) => approvalAPI.createRule(data), {
    onSuccess: () => {
      toast.success('Approval rule created successfully!')
      queryClient.invalidateQueries('approval-rules')
      handleCloseModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create approval rule')
    },
  })

  // Update rule mutation
  const updateMutation = useMutation(
    ({ ruleId, data }) => approvalAPI.updateRule(ruleId, data),
    {
      onSuccess: () => {
        toast.success('Approval rule updated successfully!')
        queryClient.invalidateQueries('approval-rules')
        handleCloseModal()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update approval rule')
      },
    }
  )

  // Delete rule mutation
  const deleteMutation = useMutation((ruleId) => approvalAPI.deleteRule(ruleId), {
    onSuccess: () => {
      toast.success('Approval rule deleted successfully!')
      queryClient.invalidateQueries('approval-rules')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete approval rule')
    },
  })

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setSelectedRule(rule)
      setFormData({
        name: rule.name,
        ruleType: rule.ruleType,
        amountThreshold: rule.amountThreshold,
        categories: rule.categories || [],
        steps: rule.steps || [{ stepNumber: 1, approvers: [] }],
        conditionalRules: rule.conditionalRules || {
          percentageRule: { enabled: false, percentage: 0 },
          specificApproverRule: { enabled: false, approvers: [] },
          hybridRule: { enabled: false, operator: 'AND' },
        },
      })
    } else {
      setSelectedRule(null)
      setFormData({
        name: '',
        ruleType: 'Sequential',
        amountThreshold: { min: 0, max: null },
        categories: [],
        steps: [{ stepNumber: 1, approvers: [] }],
        conditionalRules: {
          percentageRule: { enabled: false, percentage: 0 },
          specificApproverRule: { enabled: false, approvers: [] },
          hybridRule: { enabled: false, operator: 'AND' },
        },
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedRule(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    if (formData.steps.length === 0) {
      toast.error('At least one approval step is required')
      return
    }

    if (formData.steps.some(step => step.approvers.length === 0)) {
      toast.error('Each step must have at least one approver')
      return
    }

    if (selectedRule) {
      updateMutation.mutate({ ruleId: selectedRule.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (ruleId) => {
    if (window.confirm('Are you sure you want to delete this approval rule?')) {
      deleteMutation.mutate(ruleId)
    }
  }

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { stepNumber: formData.steps.length + 1, approvers: [] }],
    })
  }

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index)
    setFormData({ ...formData, steps: newSteps })
  }

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData({ ...formData, steps: newSteps })
  }

  const toggleCategory = (category) => {
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter(c => c !== category)
      : [...formData.categories, category]
    setFormData({ ...formData, categories: newCategories })
  }

  if (rulesLoading) {
    return <Spinner size="lg" className="mt-20" />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Rules</h1>
          <p className="text-gray-600 mt-1">
            Configure sequential, conditional, and hybrid approval workflows
          </p>
        </div>
        {currentUser?.role === ROLES.ADMIN && (
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Create Rule</span>
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <GitBranch className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Sequential</p>
              <p className="text-xs text-blue-500">Step by step approval</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Conditional</p>
              <p className="text-xs text-purple-500">Percentage or specific approver</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <CheckCircle2 className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Hybrid</p>
              <p className="text-xs text-green-500">Combine both flows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 gap-6">
        {rules.length === 0 ? (
          <div className="card text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No approval rules configured</p>
            <p className="text-sm text-gray-500 mt-2">
              Create rules to automate expense approval workflows
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="card hover:shadow-lg transition-all duration-300 border-l-4"
              style={{
                borderLeftColor:
                  rule.ruleType === 'Sequential'
                    ? '#3B82F6'
                    : rule.ruleType === 'Conditional'
                    ? '#A855F7'
                    : '#10B981',
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        rule.ruleType === 'Sequential'
                          ? 'bg-blue-100 text-blue-800'
                          : rule.ruleType === 'Conditional'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {rule.ruleType}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Amount Range</p>
                      <p className="text-gray-900">
                        ${rule.amountThreshold.min.toFixed(2)} -{' '}
                        {rule.amountThreshold.max ? `$${rule.amountThreshold.max.toFixed(2)}` : '∞'}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 font-medium mb-1">Categories</p>
                      <p className="text-gray-900">
                        {rule.categories.length > 0 ? rule.categories.join(', ') : 'All'}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 font-medium mb-1">Approval Steps</p>
                      <p className="text-gray-900">{rule.steps?.length || 0} steps</p>
                    </div>
                  </div>

                  {/* Conditional Rules Info */}
                  {rule.ruleType !== 'Sequential' && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">Conditional Rules:</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.conditionalRules?.percentageRule?.enabled && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {rule.conditionalRules.percentageRule.percentage}% approval required
                          </span>
                        )}
                        {rule.conditionalRules?.specificApproverRule?.enabled && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Specific approver: {rule.conditionalRules.specificApproverRule.approvers.length} user(s)
                          </span>
                        )}
                        {rule.conditionalRules?.hybridRule?.enabled && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Hybrid ({rule.conditionalRules.hybridRule.operator})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {currentUser?.role === ROLES.ADMIN && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(rule)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Rule"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Rule Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedRule ? 'Update Approval Rule' : 'Create Approval Rule'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <ApprovalRuleForm
              formData={formData}
              setFormData={setFormData}
              approvers={approvers}
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="btn-primary"
            >
              {createMutation.isLoading || updateMutation.isLoading ? (
                <Spinner size="sm" />
              ) : selectedRule ? (
                'Update Rule'
              ) : (
                'Create Rule'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ApprovalRules
