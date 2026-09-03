'use client';

import Image from 'next/image';
import {motion} from 'framer-motion';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {getLogoImage} from '@/src/assets/images/home/cloudinaryAssets';
import {ROUTES} from '@/src/lib/constants/routes';
import {getAuthRedirectResult} from '@/src/lib/firebase/auth';
import {useAuth} from '../hooks/useAuth';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.14 3.58-8.73z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.9l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.37-2.29v-3.1H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.39z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l3.98 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function getErrorMessage(error: unknown): string {
  const code = (error as {code?: string})?.code;
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Login dibatalkan. Coba lagi ya!';
  }
  if (code === 'auth/network-request-failed') {
    return 'Gagal terhubung ke internet. Periksa koneksi lalu coba lagi.';
  }
  return 'Gagal masuk dengan Google. Coba lagi ya!';
}

export default function LoginCard() {
  const router = useRouter();
  const {login, isLoggedIn, isInitialized} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Login SELALU lewat signInWithRedirect (full-page navigasi ke
  // accounts.google.com, lalu Google ngirim baliknya ke halaman INI lagi)
  // — begitu balik, itu RELOAD PENUH (komponen ini mount ulang dari nol),
  // bukan lanjutan `handleGoogleLogin` di bawah yang manggil login().
  // Tanpa effect ini, gak ada apapun yang nge-redirect ke home abis login
  // beneran sukses — state login-nya keisi lewat onAuthStateChanged di
  // Providers, tapi gak ada yang nindaklanjutin pindah halaman, jadi
  // keliatannya "diem aja di /login" padahal sebenarnya udah login.
  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      router.replace(ROUTES.public.home);
    }
  }, [isInitialized, isLoggedIn, router]);

  // Nangkep error SPESIFIK dari hasil redirect (mis. akun ditolak/login
  // dibatalin di accounts.google.com) begitu balik ke halaman ini.
  // providers.tsx juga manggil getAuthRedirectResult(), tapi cuma
  // nge-console.error — gak ada yang nunjukin ke USER. Redirect SELALU
  // balik ke halaman yang mulai signInWithRedirect (halaman ini sendiri),
  // jadi di sinilah tempat yang paling pas buat nunjukin alert-nya.
  useEffect(() => {
    getAuthRedirectResult().catch((err) => {
      setError(getErrorMessage(err));
      setShake(true);
      setTimeout(() => setShake(false), 400);
    });
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const outcome = await login();
      if (outcome === 'failed') {
        setError('Gagal masuk dengan Google. Coba lagi ya!');
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
      // 'redirecting' — browser lagi navigasi ke accounts.google.com, bukan
      // kegagalan. 'success' gak pernah kejadian lagi di sini (login()
      // SELALU redirect sekarang) — kalaupun suatu saat balik jadi mungkin,
      // effect isLoggedIn di atas yang nanganin pindah ke home, bukan
      // router.push manual di sini.
    } catch (err) {
      setError(getErrorMessage(err));
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{opacity: 0, scale: 0.92, y: 24}}
      animate={{opacity: 1, scale: 1, y: 0}}
      transition={{duration: 0.4, ease: [0.22, 1, 0.36, 1]}}
      className="login-card"
    >
      <div className={`login-panel ${shake ? 'login-card--shake' : ''}`}>
        <div className="login-logo-wrap">
          <span className="login-logo-glow" aria-hidden="true" />
          <Image
            src={getLogoImage('nusaquest')}
            alt="NusaQuest"
            width={156}
            height={78}
            className="login-logo"
            priority
          />
        </div>

        <h1 className="login-title font-bauhaus">Masuk ke NusaQuest</h1>
        <p className="login-subtitle poppins-bold">
          Lanjutkan petualangan budaya Nusantara-mu
        </p>

        {error && (
          <p className="login-error" role="alert">{error}</p>
        )}

        <button
          type="button"
          className="login-google-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <GoogleIcon />
          {isLoading ? 'Memproses...' : 'Masuk dengan Google'}
        </button>

        <p className="login-footnote">
          34 provinsi menunggu untuk dijelajahi
        </p>
      </div>
    </motion.section>
  );
}
