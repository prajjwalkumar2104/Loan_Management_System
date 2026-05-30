'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Users, FileCheck, Landmark, Receipt } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role === 'BORROWER') {
      router.push('/apply'); // Keep borrowers out of the dashboard entirely
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading Workspace...</div>;

  // RBAC Navigation Logic
  const getNavItems = () => {
    const items = [];
    const role = user.role;

    // Admin sees everything. Others see only their specific module.
    if (role === 'ADMIN' || role === 'SALES') items.push({ name: 'Sales (Leads)', href: '/dashboard/sales', icon: Users });
    if (role === 'ADMIN' || role === 'SANCTION') items.push({ name: 'Sanction', href: '/dashboard/sanction', icon: FileCheck });
    if (role === 'ADMIN' || role === 'DISBURSEMENT') items.push({ name: 'Disbursement', href: '/dashboard/disbursement', icon: Landmark });
    if (role === 'ADMIN' || role === 'COLLECTION') items.push({ name: 'Collection', href: '/dashboard/collection', icon: Receipt });

    return items;
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl text-blue-600">
          <LayoutDashboard className="mr-2" /> LMS Admin
        </div>
        
        <div className="p-4 flex-1 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Modules</div>
          {getNavItems().map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <span className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}