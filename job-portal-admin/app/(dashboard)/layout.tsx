'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '../../constants/routes';
import { Bell } from 'lucide-react';
import Link from 'next/link';

/**
 * Protected Dashboard Layout Shell.
 *
 * Provides a dark navy sidebar with navigation, a top header bar
 * with user avatar and notifications, and a light content area.
 * Matches the client reference design.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout } = useAuth();

  // Fail-safe redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#283046' }}>
        <div style={{
          height: 32, width: 32, borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#3b82f6',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
    { label: 'Users', href: ROUTES.USERS },
    { label: 'Recruiters', href: ROUTES.RECRUITERS },
    { label: 'Employees', href: ROUTES.EMPLOYEES },
    { label: 'Jobs', href: ROUTES.JOBS },
    { label: 'Applications', href: ROUTES.APPLICATIONS },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Derive user display name and initials
  const displayName = user?.role === 'admin' ? 'Admin' : (user?.phoneNumber || 'User');
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ─── Sidebar ─── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 180, display: 'flex', flexDirection: 'column',
        background: '#283046', zIndex: 30,
      }}>
        {/* Brand */}
        <div style={{
          padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{
            fontSize: '1.25rem', fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.02em',
          }}>
            Naukri<span style={{ color: '#60a5fa' }}>4U</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '16px 12px' }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#ffffff' : '#94a3b8',
                  background: active ? '#3b82f6' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '12px' }}>
          <button
            onClick={logout}
            style={{
              width: '100%', padding: '10px 14px',
              borderRadius: 6, border: 'none',
              background: '#ef4444', color: '#ffffff',
              fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#dc2626'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content Wrapper ─── */}
      <div style={{ flex: 1, marginLeft: 180, display: 'flex', flexDirection: 'column' }}>

        {/* Top Header Bar */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', background: '#283046',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky', top: 0, zIndex: 20, gap: 16,
        }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="#94a3b8" />
            <span style={{
              position: 'absolute', top: -4, right: -4,
              height: 16, width: 16, borderRadius: '50%',
              background: '#ef4444', color: '#fff',
              fontSize: '0.625rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              1
            </span>
          </div>

          {/* User Avatar & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#000000', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700,
            }}>
              {avatarLetter}
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', margin: 0, lineHeight: 1.3 }}>
                {displayName}
              </p>
              <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                {roleLabel}
              </p>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{
          flex: 1, padding: '32px 40px',
          background: '#f1f3f6', minHeight: 'calc(100vh - 56px)',
        }}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
