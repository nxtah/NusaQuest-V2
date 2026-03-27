import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/src/lib/utils/auth-api';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/login');
  }

  const authContext = await verifySessionToken(token);

  if (!authContext) {
    redirect('/login');
  }

  return <>{children}</>;
}
