'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getBackgroundImage } from '@/src/assets/images/background/cloudinaryAssets';
import { getLogoImage } from '@/src/assets/images/home/cloudinaryAssets';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminLogin() {
  const { login, error: authError, successMessage } = useAdminAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const error = localError ?? authError;

  const handleLogin = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    try {
      const success = await login();
      if (!success) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image src={getBackgroundImage('langit')} alt="" fill priority className="object-cover" />
        <Image src={getBackgroundImage('landprofile')} alt="" fill priority className="object-cover object-bottom" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      <div
        className={`nq-admin-login-card relative z-10 w-full max-w-md p-10 rounded-[2rem] text-center ${shake ? 'animate-admin-shake' : ''}`}
      >
        <div className="flex flex-col items-center mb-8">
          <Image
            src={getLogoImage('nusaquest')}
            alt="NusaQuest"
            width={192}
            height={96}
            className="w-48 h-auto mb-2 drop-shadow-xl"
          />
          <p className="font-bauhaus text-[#4a2a1a]/80 tracking-widest text-sm uppercase">Admin Portal</p>
        </div>

        {successMessage && (
          <div role="alert" className="mb-6 p-3 bg-green-500/15 border border-green-500/40 rounded-xl text-green-800 text-sm font-semibold">
            {successMessage}
          </div>
        )}

        {error && (
          <div role="alert" className="mb-6 p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-800 text-sm font-semibold">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={isSubmitting}
          className="nq-admin-google-btn w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.14 3.58-8.73z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.9l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.37-2.29v-3.1H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.39z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l3.98 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
          </svg>
          {isSubmitting ? 'Memeriksa...' : 'Masuk dengan Google'}
        </button>

        <p className="mt-4 text-xs text-[#4a2a1a]/60">
          Cuma akun dengan akses admin yang bisa masuk ke sini.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .nq-admin-login-card {
          background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
          box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.35),
            inset -3px -3px 8px rgba(139, 94, 42, 0.18),
            inset 3px 3px 8px rgba(255, 255, 255, 0.85);
        }
        .nq-admin-google-btn {
          background: linear-gradient(150deg, #fffdf8 0%, #f3ede0 100%);
          color: #3d2411;
          box-shadow:
            0 5px 0 #d8c8a8,
            0 8px 14px rgba(120, 92, 40, 0.25),
            inset -3px -3px 6px rgba(150, 120, 60, 0.12),
            inset 3px 3px 5px rgba(255, 255, 255, 0.9);
          transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
        }
        .nq-admin-google-btn:hover:not(:disabled) {
          filter: brightness(1.03);
          transform: translateY(-2px);
        }
        .nq-admin-google-btn:active:not(:disabled) {
          transform: translateY(2px);
          box-shadow:
            0 2px 0 #d8c8a8,
            0 3px 6px rgba(120, 92, 40, 0.2),
            inset -3px -3px 6px rgba(150, 120, 60, 0.12),
            inset 3px 3px 5px rgba(255, 255, 255, 0.9);
        }
        @keyframes admin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(4px); }
        }
        .animate-admin-shake { animation: admin-shake 0.4s ease-in-out; }
      `}} />
    </div>
  );
}
