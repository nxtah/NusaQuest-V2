'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getBackgroundImage } from '@/src/assets/images/background/cloudinaryAssets';
import { getLogoImage } from '@/src/assets/images/home/cloudinaryAssets';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError('Username atau password salah');
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image src={getBackgroundImage('langit')} alt="" fill priority className="object-cover" />
        <Image src={getBackgroundImage('landprofile')} alt="" fill priority className="object-cover object-bottom" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-full max-w-md p-10 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl text-white ${shake ? 'animate-admin-shake' : ''}`}
      >
        <div className="flex flex-col items-center mb-8">
          <Image
            src={getLogoImage('nusaquest')}
            alt="NusaQuest"
            width={192}
            height={96}
            className="w-48 h-auto mb-2 drop-shadow-xl"
          />
          <p className="text-gray-300 font-extrabold tracking-widest text-sm uppercase">Admin Portal</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-center text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="admin-username" className="block text-sm font-bold mb-2 text-gray-200">Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              placeholder="Masukkan username"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-bold mb-2 text-gray-200">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              placeholder="Masukkan password"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all active:scale-[0.98] mt-4"
          >
            {isSubmitting ? 'Memeriksa...' : 'Masuk'}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{
        __html: `
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
