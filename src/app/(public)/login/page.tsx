'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { background } from '@/src/assets/images/background/cloudinaryAssets';

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isInitialized, isLoggedIn, signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      router.replace('/home');
    }
  }, [isInitialized, isLoggedIn, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError('Gagal masuk. Coba lagi ya!');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* ── Background langit ── */}
      <div className="absolute inset-0 -z-20 bg-[#4ab8d4]">
        <Image
          src={background.langit}
          alt="Langit NusaQuest"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* ── Background laut (bawah) ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[55%] -z-10">
        <Image
          src={background.laut}
          alt="Laut"
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* ── Daratan ── */}
      <div className="absolute bottom-[-8vh] left-0 right-0 h-[60%] -z-[5]">
        <Image
          src={background.land}
          alt="Daratan"
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* ── Panel Login ── */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-[420px]">

        {/* Logo / Judul */}
        <div className="text-center drop-shadow-xl">
          <h1
            className="text-white font-black text-5xl sm:text-6xl tracking-wide"
            style={{ textShadow: '0 4px 0 rgba(0,80,120,0.5), 0 8px 20px rgba(0,0,0,0.3)' }}
          >
            NusaQuest
          </h1>
          <p className="mt-2 text-white/90 font-semibold text-base sm:text-lg"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
            Jelajahi Nusantara, Raih Kemenangan!
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-5"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.45) 100%)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 20px 50px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <p className="text-slate-700 font-semibold text-center text-sm sm:text-base">
            Masuk dengan akun Google-mu untuk mulai bermain
          </p>

          {/* Tombol Google */}
          <button
            type="button"
            id="btn-signin-google"
            onClick={handleSignIn}
            disabled={isSigningIn || !isInitialized}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 px-5 font-bold text-slate-800 text-sm sm:text-base transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <GoogleIcon />
            {isSigningIn ? 'Sedang masuk...' : 'Masuk dengan Google'}
          </button>

          {/* Error message */}
          {error && (
            <p className="text-red-600 text-sm font-semibold text-center -mt-2">
              {error}
            </p>
          )}

          <p className="text-slate-500 text-xs text-center mt-1">
            Dengan masuk, kamu menyetujui syarat & ketentuan NusaQuest.
          </p>
        </div>
      </div>
    </main>
  );
}
