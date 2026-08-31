'use client';

import {useSyncExternalStore} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {User} from 'lucide-react';
import {useAuth} from '../hooks/useAuth';
import {ROUTES} from '@/src/lib/constants/routes';

const emptySubscribe = () => () => {};

export default function ProfileHudButton() {
  const router = useRouter();
  const {user, isLoggedIn} = useAuth();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const effectiveIsLoggedIn = mounted && isLoggedIn;
  const photoURL = mounted ? user?.firebasePhotoURL || user?.googlePhotoURL : null;

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
        <div className="relative h-[clamp(2.8rem,3.4vw,4rem)] w-[clamp(2.8rem,3.4vw,4rem)] rounded-full border-2 border-white/60 shadow-lg bg-blue-400 flex items-center justify-center text-white overflow-hidden">
          {photoURL ? (
            <Image
              src={photoURL}
              alt="Foto profil"
              fill
              sizes="4rem"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="h-[55%] w-[55%]" strokeWidth={2.4} />
          )}
        </div>
      </button>
    </div>
  );
}
