'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Receipt, Search, CheckCircle, AlertCircle } from 'lucide-react';

export default function CollectionDashboard() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({ utrNumber: '', amount: '' });
  const [processing, setProcessing] = useState(false);

  const fetchActiveLoans = async () => {
    try {
      const { data } = await api.get('/loans/dashboard');
      // The backend RBAC automatically filters this to only show DISBURSED loans
      setLoans(data.loans);
    } catch (error) {
      toast.error('Failed to fetch active loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.utrNumber.trim() || Number(paymentData.amount) <= 0) {
      return toast.error('Valid UTR and Amount are required');
    }

    setProcessing(true);

    try {
      const { data } = await api.post(`/loans/${selectedLoan.id}/payment`, {
        utrNumber: paymentData.utrNumber.trim(),
        amount: Number(paymentData.amount),
      });

      if (data.loanStatus === 'CLOSED') {
        toast.success(`Payment successful! Loan is fully paid and now CLOSED.`, { duration: 5000 });
      } else {
        toast.success(`Payment recorded! Remaining Balance: ₹${data.balance.toLocaleString()}`);
      }

      // Close modal and refresh table
      setSelectedLoan(null);
      setPaymentData({ utrNumber: '', amount: '' });
      fetchActiveLoans();
      
    } catch (error: any) {
      // This catches the MongoDB 11000 Duplicate Key Error we mapped in the backend
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-4 bg-gray-200 rounded"></div></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Collections & Repayments</h1>
        <p className="text-gray-500">Record incoming UTR payments for active loans.</p>
      </div>

      {/* Active Loans Grid */}
      {loans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No active loans found</h3>
          <p className="text-gray-500">All disbursed loans have been fully repaid or none exist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">{loan.borrower?.fullName || 'Unknown'}</h3>
                  <p className="text-xs text-gray-500">PAN: {loan.pan}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">ACTIVE</span>
              </div>
              
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Principal:</span>
                  <span className="font-medium">₹{loan.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-3">
                  <span className="text-gray-500">Total Expected:</span>
                  <span className="font-bold text-blue-700">₹{loan.totalRepayment?.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={() => setSelectedLoan(loan)}
                  className="w-full mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-lg font-medium text-sm transition-colors flex justify-center items-center"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Record Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Entry Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Receipt className="w-6 h-6 mr-2 text-blue-600" /> Record Payment
              </h2>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-6 text-sm text-blue-900">
              Recording payment for <strong>{selectedLoan.borrower?.fullName}</strong>.
              Total loan value is <strong>₹{selectedLoan.totalRepayment?.toLocaleString()}</strong>.
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank UTR Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., UTR9876543210"
                  className="w-full border-gray-300 rounded-md text-black bg-white shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 uppercase"
                  value={paymentData.utrNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, utrNumber: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Must be unique. Duplicates will be rejected by the server.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedLoan.totalRepayment}
                  placeholder="0.00"
                  className="w-full border-gray-300 rounded-md text-black bg-white shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button 
                  type="button"
                  onClick={() => { setSelectedLoan(null); setPaymentData({ utrNumber: '', amount: '' }); }}
                  disabled={processing}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}