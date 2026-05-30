'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';

export default function SanctionDashboard() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [actionLoan, setActionLoan] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchLoans = async () => {
    try {
      const { data } = await api.get('/loans/dashboard');
      setLoans(data.loans);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAction = async () => {
    if (actionType === 'REJECT' && !rejectionReason.trim()) {
      return toast.error('Rejection reason is required');
    }

    setProcessing(true);
    const newStatus = actionType === 'APPROVE' ? 'SANCTIONED' : 'REJECTED';

    try {
      await api.patch(`/loans/${actionLoan.id}/status`, {
        status: newStatus,
        rejectionReason: actionType === 'REJECT' ? rejectionReason : undefined,
      });

      toast.success(`Loan explicitly ${newStatus.toLowerCase()}!`);
      setActionLoan(null);
      setActionType(null);
      setRejectionReason('');
      fetchLoans(); // Refresh the table
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-4 bg-gray-200 rounded"></div></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sanction Queue</h1>
        <p className="text-gray-500">Review pending applications and verify documents.</p>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount / Tenure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loans.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No pending applications in the queue.</td></tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{loan.borrower?.fullName || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">PAN: {loan.pan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">₹{loan.amount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{loan.tenureDays} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{loan.salary?.toLocaleString()}/mo</div>
                    <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full inline-block mt-1">
                      {loan.employmentMode.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => { setActionLoan(loan); setActionType('APPROVE'); }}
                        className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-md transition-colors"
                        title="Approve Loan"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => { setActionLoan(loan); setActionType('REJECT'); }}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition-colors"
                        title="Reject Loan"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {actionLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center mb-4">
              {actionType === 'APPROVE' ? (
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              )}
              <h2 className="text-xl font-bold">
                {actionType === 'APPROVE' ? 'Sanction Loan' : 'Reject Application'}
              </h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              You are about to {actionType?.toLowerCase()} the loan application for <strong>{actionLoan.borrower?.fullName}</strong> amounting to <strong>₹{actionLoan.amount.toLocaleString()}</strong>.
            </p>

            {actionType === 'REJECT' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
                <textarea
                  className="w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="e.g., Unverifiable salary slip..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 border-t pt-4">
              <button 
                onClick={() => { setActionLoan(null); setRejectionReason(''); }}
                disabled={processing}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                disabled={processing}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  actionType === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 flex items-center`}
              >
                {processing ? 'Processing...' : `Confirm ${actionType === 'APPROVE' ? 'Sanction' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}