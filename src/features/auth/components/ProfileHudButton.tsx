'use client';

import {useSyncExternalStore} from 'react';
import {useRouter} from 'next/navigation';
import {User} from 'lucide-react';
import {useAuth} from '../hooks/useAuth';
import {ROUTES} from '@/src/lib/constants/routes';

const emptySubscribe = () => () => {};

export default function ProfileHudButton() {
  const router = useRouter();
  const {isLoggedIn} = useAuth();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const effectiveIsLoggedIn = mounted && isLoggedIn;

  const handleClick = () => {
    router.push(effectiveIsLoggedIn ? ROUTES.protected.profile : ROUTES.public.login);
  };

  return (
    <div className="home-hud-profile">
      <button
        type="button"
        onClick={handleClick}
        aria-label={effectiveIsLoggedIn ? 'Buka profil' : 'Masuk ke akun'}
        className="block transition-transform hover:scale-105"
      >
        <div className="h-[clamp(2.8rem,3.4vw,4rem)] w-[clamp(2.8rem,3.4vw,4rem)] rounded-full border-2 border-white/60 shadow-lg bg-blue-400 flex items-center justify-center text-white">
          <User className="h-[55%] w-[55%]" strokeWidth={2.4} />
        </div>
      </button>
    </div>
  );
}
