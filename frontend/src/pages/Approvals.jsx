import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { approvalAPI } from '../services/api';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/helpers';
import { CheckCircle, XCircle } from 'lucide-react';

const Approvals = () => {
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery('pending-approvals', () =>
    approvalAPI.getPending()
  );

  const approveMutation = useMutation(
    ({ requestId, data }) => approvalAPI.approve(requestId, data),
    {
      onSuccess: () => {
        toast.success('Expense approved successfully!');
        queryClient.invalidateQueries('pending-approvals');
        setShowModal(false);
        setComment('');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to approve expense');
      },
    }
  );

  const rejectMutation = useMutation(
    ({ requestId, data }) => approvalAPI.reject(requestId, data),
    {
      onSuccess: () => {
        toast.success('Expense rejected');
        queryClient.invalidateQueries('pending-approvals');
        setShowModal(false);
        setComment('');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to reject expense');
      },
    }
  );

  const handleAction = (approval, actionType) => {
    setSelectedApproval(approval);
    setAction(actionType);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!selectedApproval) return;

    const data = { comment };

    if (action === 'approve') {
      approveMutation.mutate({ requestId: selectedApproval.id, data });
    } else {
      if (!comment.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      rejectMutation.mutate({ requestId: selectedApproval.id, data });
    }
  };

  if (isLoading) {
    return <Spinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <div className="text-sm text-gray-600">
          {data?.approvals?.length || 0} pending approvals
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Description</th>
                <th className="table-header-cell">Category</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {data?.approvals?.map((approval) => (
                <tr key={approval.id}>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{approval.Expense?.User?.name}</div>
                      <div className="text-xs text-gray-500">{approval.Expense?.User?.email}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="max-w-xs truncate">{approval.Expense?.description}</div>
                  </td>
                  <td className="table-cell">{approval.Expense?.category}</td>
                  <td className="table-cell font-medium">
                    {formatCurrency(approval.Expense?.amount, approval.Expense?.currency)}
                  </td>
                  <td className="table-cell">{formatDate(approval.Expense?.date)}</td>
                  <td className="table-cell">
                    <StatusBadge status={approval.status} />
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction(approval, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleAction(approval, 'reject')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.approvals || data.approvals.length === 0) && (
                <tr>
                  <td colSpan="7" className="table-cell text-center text-gray-500 py-8">
                    No pending approvals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setComment('');
        }}
        title={action === 'approve' ? 'Approve Expense' : 'Reject Expense'}
      >
        <div className="space-y-4">
          {selectedApproval && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Employee:</span>
                <span className="font-medium">{selectedApproval.Expense?.User?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-medium">
                  {formatCurrency(selectedApproval.Expense?.amount, selectedApproval.Expense?.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="font-medium">{selectedApproval.Expense?.description}</span>
              </div>
            </div>
          )}

          <div>
            <label className="input-label">
              Comment {action === 'reject' && <span className="text-red-600">*</span>}
            </label>
            <textarea
              className="input-field"
              rows="4"
              placeholder={
                action === 'approve'
                  ? 'Add any comments (optional)'
                  : 'Please provide a reason for rejection'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => {
                setShowModal(false);
                setComment('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={approveMutation.isLoading || rejectMutation.isLoading}
              className={action === 'approve' ? 'btn-success' : 'btn-danger'}
            >
              {approveMutation.isLoading || rejectMutation.isLoading ? (
                <Spinner size="sm" />
              ) : action === 'approve' ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Approvals;
