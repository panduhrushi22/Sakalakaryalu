'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Save token and fire custom event to update Navbar state
      localStorage.setItem('adminToken', data.token);
      window.dispatchEvent(new Event('authChange'));
      
      router.push('/admin/dashboard');
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-stone-50/50">
      <div className="bg-white border-2 border-amber-300 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
        
        {/* Logo and header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500 text-stone-950 rounded-full shadow-[0_0_15px_rgba(217,119,6,0.3)] animate-pulse">
            <Flame className="h-6 w-6 text-stone-950 fill-amber-950" />
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-black tracking-widest text-amber-800">
            ADMINISTRATIVE SECURE ACCESS
          </h2>
          <p className="font-lora text-xs text-stone-500">
            Sakalakaryalu Spiritual Management Platform
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-amber-500" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sakalakaryalu.com"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm font-outfit"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 font-outfit font-black text-xs tracking-wider py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 uppercase mt-4"
          >
            {isLoading ? 'Authenticating Admin...' : 'Secure Login'}
          </button>
        </form>

        {/* Bottom instructions */}
        <div className="bg-amber-50/40 border border-amber-200/50 p-4 rounded-2xl text-[10px] text-stone-500 font-lora leading-relaxed text-center">
          Default seed credentials are populated. Contact site support if you lost your password settings.
        </div>

      </div>
    </div>
  );
}
