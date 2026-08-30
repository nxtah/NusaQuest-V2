'use client';

import AdminDashboard from '@/src/features/admin-v2/components/AdminDashboard';
import AdminLogin from '@/src/features/admin-v2/auth/components/AdminLogin';
import { useAdminAuth } from '@/src/features/admin-v2/auth/hooks/useAdminAuth';
import Loader from '@/src/components/ui/Loader';

export default function AdminPage() {
  const { isLoggedIn, isLoading, logout } = useAdminAuth();

  if (isLoading) return <Loader message="Memeriksa akses admin..." />;

  return isLoggedIn ? <AdminDashboard onLogout={logout} /> : <AdminLogin />;
}
