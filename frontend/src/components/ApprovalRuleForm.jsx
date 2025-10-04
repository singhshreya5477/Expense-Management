import { Plus } from 'lucide-react'
import { EXPENSE_CATEGORIES } from '../utils/constants'

const ApprovalRuleForm = ({ formData, setFormData, approvers }) => {
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

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="input-label">
            Rule Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., High Value Expense Approval"
          />
        </div>

        <div>
          <label className="input-label">
            Rule Type <span className="text-red-600">*</span>
          </label>
          <select
            required
            className="input-field"
            value={formData.ruleType}
            onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
          >
            <option value="Sequential">Sequential (Step by step)</option>
            <option value="Conditional">Conditional (Percentage/Specific)</option>
            <option value="Hybrid">Hybrid (Combined)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.ruleType === 'Sequential' && 'Expenses go through approvers one by one in sequence'}
            {formData.ruleType === 'Conditional' && 'Approval based on percentage or specific approver'}
            {formData.ruleType === 'Hybrid' && 'Combine sequential steps with conditional rules'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Minimum Amount ($)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={formData.amountThreshold.min}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amountThreshold: { ...formData.amountThreshold, min: parseFloat(e.target.value) || 0 },
                })
              }
            />
          </div>
          <div>
            <label className="input-label">Maximum Amount ($) - Optional</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={formData.amountThreshold.max || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amountThreshold: {
                    ...formData.amountThreshold,
                    max: e.target.value ? parseFloat(e.target.value) : null,
                  },
                })
              }
              placeholder="No limit"
            />
          </div>
        </div>

        <div>
          <label className="input-label">Categories (Leave empty for all)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {EXPENSE_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Approval Steps (for Sequential and Hybrid) */}
      {(formData.ruleType === 'Sequential' || formData.ruleType === 'Hybrid') && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Approval Steps</h3>
            <button type="button" onClick={addStep} className="btn-secondary text-sm">
              <Plus size={16} className="inline mr-1" />
              Add Step
            </button>
          </div>

          <div className="space-y-4">
            {formData.steps.map((step, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Step {index + 1}</h4>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className="input-label text-sm">
                    Select Approvers <span className="text-red-600">*</span>
                  </label>
                  <select
                    multiple
                    required
                    className="input-field"
                    value={step.approvers}
                    onChange={(e) =>
                      updateStep(
                        index,
                        'approvers',
                        Array.from(e.target.selectedOptions, (option) => option.value)
                      )
                    }
                    size="5"
                  >
                    {approvers.map((approver) => (
                      <option key={approver.id} value={approver.id}>
                        {approver.name} ({approver.role})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple approvers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditional Rules (for Conditional and Hybrid) */}
      {(formData.ruleType === 'Conditional' || formData.ruleType === 'Hybrid') && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-4">Conditional Rules</h3>

          <div className="space-y-4">
            {/* Percentage Rule */}
            <div className="p-4 border rounded-lg">
              <label className="flex items-center space-x-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.conditionalRules.percentageRule.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conditionalRules: {
                        ...formData.conditionalRules,
                        percentageRule: {
                          ...formData.conditionalRules.percentageRule,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                  className="rounded text-primary-600"
                />
                <span className="font-medium text-gray-900">Percentage Rule</span>
              </label>

              {formData.conditionalRules.percentageRule.enabled && (
                <div>
                  <label className="input-label text-sm">Required Approval Percentage</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="input-field"
                    value={formData.conditionalRules.percentageRule.percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditionalRules: {
                          ...formData.conditionalRules,
                          percentageRule: {
                            ...formData.conditionalRules.percentageRule,
                            percentage: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    placeholder="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    e.g., If 60% of approvers approve, expense is approved
                  </p>
                </div>
              )}
            </div>

            {/* Specific Approver Rule */}
            <div className="p-4 border rounded-lg">
              <label className="flex items-center space-x-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.conditionalRules.specificApproverRule.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conditionalRules: {
                        ...formData.conditionalRules,
                        specificApproverRule: {
                          ...formData.conditionalRules.specificApproverRule,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                  className="rounded text-primary-600"
                />
                <span className="font-medium text-gray-900">Specific Approver Rule</span>
              </label>

              {formData.conditionalRules.specificApproverRule.enabled && (
                <div>
                  <label className="input-label text-sm">Select Specific Approver(s)</label>
                  <select
                    multiple
                    className="input-field"
                    value={formData.conditionalRules.specificApproverRule.approvers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditionalRules: {
                          ...formData.conditionalRules,
                          specificApproverRule: {
                            ...formData.conditionalRules.specificApproverRule,
                            approvers: Array.from(e.target.selectedOptions, (option) => option.value),
                          },
                        },
                      })
                    }
                    size="4"
                  >
                    {approvers.map((approver) => (
                      <option key={approver.id} value={approver.id}>
                        {approver.name} ({approver.role})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    e.g., If CFO approves, expense is auto-approved
                  </p>
                </div>
              )}
            </div>

            {/* Hybrid Operator */}
            {formData.ruleType === 'Hybrid' && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <label className="flex items-center space-x-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={formData.conditionalRules.hybridRule.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditionalRules: {
                          ...formData.conditionalRules,
                          hybridRule: {
                            ...formData.conditionalRules.hybridRule,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded text-primary-600"
                  />
                  <span className="font-medium text-gray-900">Enable Hybrid Operator</span>
                </label>

                {formData.conditionalRules.hybridRule.enabled && (
                  <div>
                    <label className="input-label text-sm">Combine Rules With</label>
                    <select
                      className="input-field"
                      value={formData.conditionalRules.hybridRule.operator}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditionalRules: {
                            ...formData.conditionalRules,
                            hybridRule: {
                              ...formData.conditionalRules.hybridRule,
                              operator: e.target.value,
                            },
                          },
                        })
                      }
                    >
                      <option value="AND">AND (All must approve)</option>
                      <option value="OR">OR (Any can approve)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Combine sequential steps with conditional rules using AND/OR logic
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalRuleForm
