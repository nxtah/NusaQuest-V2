'use client';

import { useRouter } from 'next/navigation';
import AdminDashboard from '@/src/features/admin-v2/components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  return (
    <AdminDashboard
      onLogout={() => {
        router.push('/home');
      }}
    />
  );
}
