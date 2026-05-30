'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Landmark, CheckCircle, ArrowRightCircle } from 'lucide-react';

export default function DisbursementDashboard() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [actionLoan, setActionLoan] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const fetchSanctionedLoans = async () => {
    try {
      const { data } = await api.get('/loans/dashboard');
      setLoans(data.loans);
    } catch (error) {
      toast.error('Failed to fetch sanctioned loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSanctionedLoans();
  }, []);

  const handleDisbursement = async () => {
    setProcessing(true);
    try {
      await api.patch(`/loans/${actionLoan.id}/status`, {
        status: 'DISBURSED',
      });

      toast.success('Funds successfully disbursed!');
      setActionLoan(null);
      fetchSanctionedLoans(); // Refresh the table
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Disbursement failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-4 bg-gray-200 rounded"></div></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disbursement Queue</h1>
        <p className="text-gray-500">Review sanctioned loans and release funds to borrowers.</p>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sanctioned Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details (PAN)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loans.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No loans waiting for disbursement.</td></tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{loan.borrower?.fullName || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-blue-700 text-lg">₹{loan.amount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Repayment: ₹{loan.totalRepayment?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 inline-block rounded">
                      {loan.pan}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setActionLoan(loan)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Release Funds <ArrowRightCircle className="ml-2 w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {actionLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center mb-4 text-blue-600">
              <Landmark className="w-8 h-8 mr-3" />
              <h2 className="text-xl font-bold">Confirm Disbursement</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              You are authorizing the release of <strong>₹{actionLoan.amount.toLocaleString()}</strong> to <strong>{actionLoan.borrower?.fullName}</strong>. This action will change the status to <span className="font-bold">DISBURSED</span> and send the loan to Collections.
            </p>

            <div className="flex justify-end space-x-3 border-t pt-4">
              <button 
                onClick={() => setActionLoan(null)}
                disabled={processing}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDisbursement}
                disabled={processing}
                className="px-4 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {processing ? 'Processing...' : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Confirm Release
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}