'use client';

import AdminDashboard from '@/src/features/admin-v2/components/AdminDashboard';
import AdminLogin from '@/src/features/admin-v2/auth/components/AdminLogin';
import { useAdminAuth } from '@/src/features/admin-v2/auth/hooks/useAdminAuth';

export default function AdminPage() {
  const { isLoggedIn, logout } = useAdminAuth();

  return isLoggedIn ? <AdminDashboard onLogout={logout} /> : <AdminLogin />;
}
