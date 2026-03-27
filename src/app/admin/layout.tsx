import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ROUTES } from '../../lib/constants/routes';
import { verifyServerSession } from '../../lib/utils/server-session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyServerSession(await cookies());

  if (!session.authenticated) {
    redirect(ROUTES.public.login);
  }

  if (session.role !== 'admin') {
    redirect(ROUTES.public.home);
  }

  return <>{children}</>;
}
