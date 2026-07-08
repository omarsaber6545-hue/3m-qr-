'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { QrCode, Mail, Lock, User, Loader2, Github, AlertTriangle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading, error, initialize } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    initialize();
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name || !email || !password) {
      setFormError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    try {
      await signup({ name, email, password });
      router.push('/dashboard');
    } catch (err: any) {
      // Handled by store
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github' | 'discord') => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiBase}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-[#030307] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              3M <span className="text-purple-500">QR Studio</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-100">Create Account</h2>
          <p className="text-sm text-gray-500">Get 10 free credits to test artistic AI styles</p>
        </div>

        {/* CARD CONTAINER */}
        <div className="glass-panel border border-white/5 rounded-2xl p-8 bg-white/5">
          {/* GENERAL ERROR SUMMARY */}
          {(error || formError) && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2 items-center text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 h-12 text-sm text-white focus:outline-none transition"
                />
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 h-12 text-sm text-white focus:outline-none transition"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters" 
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 h-12 text-sm text-white focus:outline-none transition"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6 glow-btn"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
            </button>
          </form>

          {/* OAUTH SECTION */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <span className="relative bg-[#0b0b14] px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Or continue with</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => handleOAuthLogin('google')}
              className="h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-sm font-medium text-white transition"
            >
              Google
            </button>
            <button 
              onClick={() => handleOAuthLogin('github')}
              className="h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-sm font-medium text-white transition"
            >
              <Github className="w-4 h-4 mr-2" /> GitHub
            </button>
            <button 
              onClick={() => handleOAuthLogin('discord')}
              className="h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-sm font-medium text-white transition"
            >
              Discord
            </button>
          </div>
        </div>

        {/* SWITCH VIEW LINK */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
