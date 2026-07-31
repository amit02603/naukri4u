'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Users, Briefcase, FileSpreadsheet, UserCheck } from 'lucide-react';

/**
 * Dashboard Home Page.
 * Shows summary stat cards for quick overview of platform data.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Users', value: '5', icon: Users, color: '#3b82f6' },
    { label: 'Recruiters', value: '2', icon: UserCheck, color: '#8b5cf6' },
    { label: 'Active Jobs', value: '3', icon: Briefcase, color: '#22c55e' },
    { label: 'Applications', value: '1', icon: FileSpreadsheet, color: '#f59e0b' },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Welcome Banner */}
      <div style={{
        background: '#ffffff', borderRadius: 8, padding: '24px 28px',
        border: '1px solid #e2e8f0', marginBottom: 28,
      }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: '0 0 6px' }}>
          Welcome back{user?.role === 'admin' ? ', Admin' : ''}!
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Here is a quick overview of your Naukri4U platform activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: '#ffffff', borderRadius: 8, padding: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: `${stat.color}15`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1.2 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Account Info Card */}
      <div style={{
        background: '#ffffff', borderRadius: 8, padding: '24px 28px',
        border: '1px solid #e2e8f0',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 16px' }}>
          Your Account
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 500 }}>Phone Number</p>
            <p style={{ fontSize: '0.875rem', color: '#1e293b', margin: 0, fontWeight: 500 }}>{user?.phoneNumber || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 500 }}>Role</p>
            <p style={{ fontSize: '0.875rem', color: '#1e293b', margin: 0, fontWeight: 500, textTransform: 'capitalize' }}>{user?.role || 'No Role'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 500 }}>Status</p>
            <p style={{ fontSize: '0.875rem', color: '#22c55e', margin: 0, fontWeight: 500, textTransform: 'capitalize' }}>{user?.status || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 500 }}>Member Since</p>
            <p style={{ fontSize: '0.875rem', color: '#1e293b', margin: 0, fontWeight: 500 }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
