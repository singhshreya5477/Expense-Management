import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { expenseAPI, approvalAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import { formatCurrency, formatDate, formatDateTime, handleApiError } from '../utils/helpers'
import { ArrowLeft, Download, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

const ExpenseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState(null)
  const [comments, setComments] = useState('')

  const { data, isLoading } = useQuery(['expense', id], () => expenseAPI.getExpense(id))

  const approveMutation = useMutation(
    ({ action, comments }) => {
      if (action === 'approve') {
        return approvalAPI.approveExpense(id, { comments })
      } else {
        return approvalAPI.rejectExpense(id, { comments })
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expense', id])
        queryClient.invalidateQueries('expenses')
        queryClient.invalidateQueries('pendingApprovals')
        toast.success(`Expense ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully!`)
        setShowApprovalModal(false)
        setComments('')
      },
      onError: (error) => {
        toast.error(handleApiError(error))
      },
    }
  )

  const handleApprovalAction = (action) => {
    setApprovalAction(action)
    setShowApprovalModal(true)
  }

  const submitApproval = () => {
    approveMutation.mutate({ action: approvalAction, comments })
  }

  if (isLoading) {
    return <Spinner />
  }

  const expense = data?.data?.data

  if (!expense) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Expense not found</p>
        <button onClick={() => navigate('/expenses')} className="btn-primary mt-4">
          Back to Expenses
        </button>
      </div>
    )
  }

  const canApprove =
    (user?.role === 'Manager' || user?.role === 'Admin') &&
    expense.status === 'Pending' &&
    expense.employee?._id !== user?._id

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/expenses')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to Expenses</span>
        </button>
        <StatusBadge status={expense.status} />
      </div>

      {/* Expense Details */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Expense Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">Description</label>
            <p className="font-medium text-lg">{expense.description}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Category</label>
            <p className="font-medium text-lg">{expense.category}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Amount</label>
            <p className="font-medium text-lg">
              {formatCurrency(expense.amount, expense.currency?.code, expense.currency?.symbol)}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Converted Amount</label>
            <p className="font-medium text-lg">
              {formatCurrency(
                expense.convertedAmount,
                expense.company?.currency?.code,
                expense.company?.currency?.symbol
              )}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Date</label>
            <p className="font-medium text-lg">{formatDate(expense.date)}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Submitted By</label>
            <p className="font-medium text-lg">{expense.employee?.name || 'Unknown'}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Submitted On</label>
            <p className="font-medium text-lg">{formatDateTime(expense.createdAt)}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Status</label>
            <p className="font-medium text-lg">{expense.status}</p>
          </div>
        </div>
      </div>

      {/* Receipt */}
      {expense.receipt && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Receipt</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{expense.receipt.filename}</p>
                {expense.receipt.extractedData?.merchantName && (
                  <p className="text-sm text-gray-600">
                    Merchant: {expense.receipt.extractedData.merchantName}
                  </p>
                )}
              </div>
              <a
                href={`/api/expenses/${expense._id}/receipt`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Download</span>
              </a>
            </div>

            {expense.receipt.extractedData && (
              <div>
                <h4 className="font-medium mb-2">Extracted Data</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {expense.receipt.extractedData.date && (
                    <p>Date: {formatDate(expense.receipt.extractedData.date)}</p>
                  )}
                  {expense.receipt.extractedData.amount && (
                    <p>Amount: {formatCurrency(expense.receipt.extractedData.amount)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Lines */}
      {expense.expenseLines && expense.expenseLines.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expense.expenseLines.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{line.description}</td>
                    <td className="px-4 py-2 text-sm">{line.category || '-'}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {formatCurrency(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comments/History */}
      {expense.comments && expense.comments.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Approval History</h3>
          <div className="space-y-4">
            {expense.comments.map((comment, index) => (
              <div key={index} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                <MessageSquare className="text-gray-400 mt-1" size={20} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{comment.user?.name || 'Unknown'}</p>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(comment.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.comment}</p>
                  {comment.action && (
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        comment.action === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {comment.action}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Actions */}
      {canApprove && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <h3 className="text-lg font-semibold mb-4">Approval Required</h3>
          <p className="text-gray-700 mb-4">
            This expense requires your approval. Please review the details and take action.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => handleApprovalAction('approve')}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle size={20} />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleApprovalAction('reject')}
              className="btn-danger flex items-center space-x-2"
            >
              <XCircle size={20} />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={`${approvalAction === 'approve' ? 'Approve' : 'Reject'} Expense`}
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to {approvalAction} this expense?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Add any comments..."
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowApprovalModal(false)}
              className="btn-secondary"
              disabled={approveMutation.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={submitApproval}
              className={`${
                approvalAction === 'approve' ? 'btn-primary' : 'btn-danger'
              } flex items-center space-x-2`}
              disabled={approveMutation.isLoading}
            >
              {approveMutation.isLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  {approvalAction === 'approve' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  <span>{approvalAction === 'approve' ? 'Approve' : 'Reject'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ExpenseDetail
