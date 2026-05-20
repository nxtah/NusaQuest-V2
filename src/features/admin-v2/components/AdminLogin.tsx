'use client';
import { useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123') {
      onLoginSuccess();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Combo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img src="https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363032/langit_uh640b.webp" alt="Langit" className="absolute inset-0 w-full h-full object-cover" />
        <img src="https://res.cloudinary.com/dprxjzfxp/image/upload/v1774523645/NQR3_1_vihh5b.webp" alt="Landprofile" className="absolute bottom-0 w-full h-full object-cover object-bottom" />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-10 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl text-white">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://res.cloudinary.com/dprxjzfxp/image/upload/q_auto/f_auto/v1776085647/logo_ywb81o.webp" 
            alt="NusaQuest Logo" 
            className="w-48 mb-2 drop-shadow-xl"
          />
          <p className="text-gray-300 font-extrabold tracking-widest text-sm uppercase">Admin Portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-center text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-200">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-200">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              placeholder="Enter password"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all active:scale-[0.98] mt-4"
          >
            LOG IN
          </button>
        </form>
      </div>
    </div>
  );
}
