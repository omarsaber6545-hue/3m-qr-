'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  QrCode, Sparkles, History, FolderHeart, CreditCard, Settings, 
  ShieldAlert, LogOut, Menu, X, Coins, User
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, initialize, logout, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    // If not authenticated and store initialized, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#020204] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { name: 'Studio', href: '/dashboard/studio', icon: Sparkles },
    { name: 'Projects', href: '/dashboard/projects', icon: History },
    { name: 'Collections', href: '/dashboard/collections', icon: FolderHeart },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#030307] text-gray-100 flex flex-col md:flex-row relative">
      {/* MOBILE HEADER */}
      <header className="md:hidden h-16 border-b border-white/5 bg-[#05050c]/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">3M QR Studio</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:sticky top-16 md:top-0 left-0 h-[calc(100vh-64px)] md:h-screen w-64 border-r border-white/5 
        bg-[#05050a] flex flex-col justify-between p-6 z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-8">
          {/* Logo (Desktop only) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              3M <span className="text-purple-500">QR Studio</span>
            </span>
          </div>

          {/* Credits Box */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Credits</div>
                <div className="text-sm font-bold text-white">{user.credits} remaining</div>
              </div>
            </div>
            <a href="/dashboard/billing" className="text-xs font-bold text-purple-400 hover:underline">Top Up</a>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || pathname?.startsWith(link.href);
              return (
                <a 
                  key={link.name} 
                  href={link.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                    ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/15' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </a>
              );
            })}

            {/* Admin Panel Link */}
            {isAdmin && (
              <a 
                href="/dashboard/admin"
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition mt-4 border border-red-500/20
                  ${pathname?.startsWith('/dashboard/admin') ? 'bg-red-950/40 text-red-400 border-red-500/40' : 'text-red-400/80 hover:bg-red-950/20 hover:text-red-400'}
                `}
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Panel
              </a>
            )}
          </nav>
        </div>

        {/* User profile / Logout bottom panel */}
        <div className="border-t border-white/5 pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{user.name}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* SIDEBAR OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* DASHBOARD MAIN CONTENT WINDOW */}
      <main className="flex-1 min-h-[calc(100vh-64px)] md:min-h-screen overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
