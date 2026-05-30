'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ApplicationSuccessPage() {
  const handleLogout = () => {
    localStorage.clear();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-600 mb-8">
          Your loan application has been successfully forwarded to the Sanction team for review.
        </p>
        <Link 
          href="/login" 
          onClick={handleLogout}
          className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium transition-colors"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}