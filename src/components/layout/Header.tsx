'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/src/features/auth/hooks/useAuth';

interface HeaderProps {
  showBackIcon?: boolean;
  showTextHeader?: string;
}

export default function Header({showBackIcon = false, showTextHeader}: HeaderProps) {
  const router = useRouter();
  const {isLoggedIn, user, logout} = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="header-container py-3 border-bottom">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {showBackIcon && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => router.back()}
            >
              ← Back
            </button>
          )}
          {showTextHeader && <h5 className="mb-0">{showTextHeader}</h5>}
          {!showTextHeader && !showBackIcon && (
            <Link href="/home" className="text-decoration-none">
              <h5 className="mb-0">NusaQuest</h5>
            </Link>
          )}
        </div>

        <nav className="d-flex gap-3 align-items-center">
          <Link href="/information" className="text-decoration-none">
            Info
          </Link>
          {isLoggedIn && (
            <>
              <span className="text-muted">{user?.displayName}</span>
              <Link href="/profile" className="text-decoration-none">
                Profile
              </Link>
              <button className="btn btn-sm btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
          {!isLoggedIn && (
            <Link href="/login" className="btn btn-sm btn-primary">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
