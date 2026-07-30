'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../../constants/routes';
import { LogOut, Home, Users, Briefcase, FileSpreadsheet, Bell, Shield } from 'lucide-react';
import Link from 'next/link';

/**
 * Protected Dashboard Layout Shell.
 * 
 * Provides sidebar navigation, active session verification, and a header
 * panel detailing user roles and database tokens.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuth();

  // Fail-safe redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', icon: Home, href: ROUTES.DASHBOARD },
    { label: 'Users', icon: Users, href: ROUTES.USERS },
    { label: 'Recruiters', icon: Users, href: ROUTES.RECRUITERS },
    { label: 'Employees', icon: Users, href: ROUTES.EMPLOYEES },
    { label: 'Jobs', icon: Briefcase, href: ROUTES.JOBS },
    { label: 'Applications', icon: FileSpreadsheet, href: ROUTES.APPLICATIONS },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      
      {/* ─── Sidebar ─── */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-900 bg-slate-950/50 backdrop-blur-md">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
            N
          </div>
          <span className="font-bold tracking-tight text-slate-200">naukri4U Console</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-all group"
            >
              <item.icon className="h-4.5 w-4.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer User Info */}
        <div className="border-t border-slate-900 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-emerald-400">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.phoneNumber}</p>
              <p className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-500" />
                {user?.role || 'No Role Assigned'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-900 bg-slate-900/50 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/30 px-3 py-2 text-sm font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content Wrapper ─── */}
      <div className="flex-1 pl-64">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-900 bg-slate-950/30 px-8 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
            Platform Overview
          </h2>
          <div className="flex items-center gap-4">
            {/* Notification placeholder */}
            <button className="relative p-2 rounded-lg hover:bg-slate-900 transition-colors text-slate-400 hover:text-slate-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500"></span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
}
