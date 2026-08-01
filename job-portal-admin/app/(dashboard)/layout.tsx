'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '../../constants/routes';
import { Bell, User, LogOut, CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react';
import Link from 'next/link';

/**
 * Protected Dashboard Layout Shell.
 *
 * Provides a dark navy sidebar with navigation, a top header bar
 * with interactive user avatar dropdown and notification popover,
 * and a light content area. Matches the client reference design.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(1);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fail-safe redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isInitialized, isAuthenticated, router]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const rawRole = user?.role as unknown;
  const normalizedRole = Array.isArray(rawRole) ? rawRole[0] : (typeof rawRole === 'string' ? rawRole : '');
  
  const displayName = normalizedRole === 'admin' ? 'Admin' : (user?.phoneNumber || 'User');
  const roleLabel = normalizedRole ? normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1) : 'User';
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
          <div ref={notificationsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: 4, position: 'relative',
              }}
            >
              <Bell size={20} color="#94a3b8" />
              {unreadNotifications > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  height: 16, width: 16, borderRadius: '50%',
                  background: '#ef4444', color: '#fff',
                  fontSize: '0.625rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div style={{
                position: 'absolute', right: 0, top: 36, width: 300,
                background: '#ffffff', borderRadius: 8,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>Notifications</span>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={() => setUnreadNotifications(0)}
                      style={{
                        background: 'none', border: 'none', color: '#3b82f6',
                        fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
                  <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                      System Ready
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>
                      Naukri4U Admin Console initialized successfully.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Info Dropdown */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px',
                borderRadius: 6, transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#3b82f6', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                {avatarLetter}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', margin: 0, lineHeight: 1.3 }}>
                  {displayName}
                </p>
                <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                  {roleLabel}
                </p>
              </div>
              <ChevronDown size={14} color="#94a3b8" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 44, width: 220,
                background: '#ffffff', borderRadius: 8,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                    {user?.phoneNumber || 'User Account'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <ShieldCheck size={14} color="#22c55e" />
                    <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, textTransform: 'capitalize' }}>
                      {roleLabel} Status
                    </span>
                  </div>
                </div>
                <div style={{ padding: 6 }}>
                  <button
                    onClick={logout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', border: 'none', background: 'transparent',
                      color: '#ef4444', fontSize: '0.875rem', fontWeight: 500,
                      borderRadius: 4, cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <LogOut size={16} color="#ef4444" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
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
