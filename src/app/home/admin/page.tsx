'use client';
import { useState } from 'react';
import AdminLogin from '@/src/features/admin-v2/components/AdminLogin';
import AdminDashboard from '@/src/features/admin-v2/components/AdminDashboard';

export default function AdminPageWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
}
