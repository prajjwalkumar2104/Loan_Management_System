'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Auto-route based on role
      switch (user.role) {
        case 'SALES': router.replace('/dashboard/sales'); break;
        case 'SANCTION': router.replace('/dashboard/sanction'); break;
        case 'DISBURSEMENT': router.replace('/dashboard/disbursement'); break;
        case 'COLLECTION': router.replace('/dashboard/collection'); break;
        case 'ADMIN': router.replace('/dashboard/sales'); break; // Admin starts at Sales
        default: router.replace('/login');
      }
    }
  }, [router]);

  return <div className="text-gray-500">Redirecting to your module...</div>;
}