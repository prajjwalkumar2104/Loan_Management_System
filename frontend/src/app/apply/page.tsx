'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ApplyLoanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    dob: '',
    salary: 50000,
    pan: '',
    employmentMode: 'SALARIED',
    salarySlipUrl: 'https://dummyimage.com/pdf-placeholder', // Mocked for speed
    amount: 100000,
    tenureDays: 180,
  });

  // Derived State for live calculation
  const [calculations, setCalculations] = useState({ si: 0, total: 0 });

 // Live Simple Interest Calculator
  useEffect(() => {
    const rate = 12;
    const principal = Number(formData.amount);
    const time = Number(formData.tenureDays);
    
    const si = (principal * rate * time) / (365 * 100);
    
    setCalculations({
      si: Math.round(si),
      total: Math.round(principal + si),
    });
  }, [formData.amount, formData.tenureDays]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Validate BRE on the Client Side for instant feedback
  const handleNextToStep2 = () => {
    const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (age < 23 || age > 50) return toast.error('Age must be between 23 and 50');
    if (formData.salary < 25000) return toast.error('Salary must be at least 25,000/month');
    if (!panRegex.test(formData.pan)) return toast.error('Invalid PAN format');
    if (formData.employmentMode === 'UNEMPLOYED') return toast.error('Unemployed applicants are not eligible');

    setStep(2);
  };

  
const submitApplication = async () => {
    setLoading(true);
    try {
      // FORCE strings into actual Numbers before sending to backend
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        tenureDays: Number(formData.tenureDays),
        salary: Number(formData.salary),
      };

      await api.post('/loans/apply', payload);
      toast.success('Loan Applied Successfully!');
      router.push('/apply/success');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl text-black w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        
        {/* Progress Indicator */}
        <div className="flex justify-between border-b pb-4 mb-6">
          <span className={`font-semibold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>1. Details</span>
          <span className={`font-semibold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>2. Upload</span>
          <span className={`font-semibold ${step === 3 ? 'text-blue-600' : 'text-gray-400'}`}>3. Configure</span>
        </div>

        {/* STEP 1: Personal Details (BRE Checks) */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl text-gray-900 font-bold">Personal Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Monthly Salary (₹)</label>
              <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">PAN Number</label>
              <input type="text" name="pan" placeholder="ABCDE1234F" value={formData.pan} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border uppercase" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Employment Mode</label>
              <select name="employmentMode" value={formData.employmentMode} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                <option value="SALARIED">Salaried</option>
                <option value="SELF_EMPLOYED">Self-Employed</option>
                <option value="UNEMPLOYED">Unemployed</option>
              </select>
            </div>

            <button onClick={handleNextToStep2} className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 font-bold mt-6">
              Continue to Uploads
            </button>
          </div>
        )}

        {/* STEP 2: Upload Salary Slip */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl text-gray-900 font-bold">Upload Documents</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 cursor-pointer">
              <p className="text-sm text-gray-600">Drag and drop your Salary Slip (PDF/JPG) up to 5MB.</p>
              <input type="file" className="mt-4" accept=".pdf,.jpg,.png" />
            </div>
            
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Back</button>
              <button onClick={() => setStep(3)} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Configure Loan</button>
            </div>
          </div>
        )}

        {/* STEP 3: Loan Configuration (Sliders) */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl text-gray-900 font-bold">Configure Your Loan</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount: ₹{formData.amount.toLocaleString()}</label>
              <input type="range" name="amount" min="50000" max="500000" step="10000" value={formData.amount} onChange={handleChange} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-1"><span>₹50K</span><span>₹5L</span></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenure: {formData.tenureDays} days</label>
              <input type="range" name="tenureDays" min="30" max="365" step="1" value={formData.tenureDays} onChange={handleChange} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-1"><span>30 days</span><span>365 days</span></div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
              <h3 className="font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-2">Repayment Summary (12% p.a.)</h3>
              <div className="flex justify-between mb-1"><span className="text-blue-800">Principal:</span> <span className="font-medium text-black">₹{Number(formData.amount).toLocaleString()}</span></div>
              <div className="flex justify-between mb-1"><span className="text-blue-800">Interest (SI):</span> <span className="font-medium text-black">₹{calculations.si.toLocaleString()}</span></div>
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-blue-200"><span className="text-blue-900">Total Repayment:</span> <span className="text-blue-700">₹{calculations.total.toLocaleString()}</span></div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="px-6 py-3 border rounded-md text-gray-700 hover:bg-gray-50">Back</button>
              <button onClick={submitApplication} disabled={loading} className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold disabled:opacity-50">
                {loading ? 'Submitting...' : 'Apply Now'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}