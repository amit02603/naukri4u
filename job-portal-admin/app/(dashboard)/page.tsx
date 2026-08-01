'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { adminService, DashboardStats } from '../../services/adminService';
import { Users, UserCheck, Briefcase, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ROUTES } from '../../constants/routes';

/**
 * Dashboard Home Page.
 * Shows welcome banner, stat cards, application overview chart,
 * user distribution donut, quick actions, recent activity, and recent jobs.
 * All data powered by the /admin/dashboard API.
 */

const PIE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#94a3b8'];

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await adminService.getDashboardStats();
      return res.data as DashboardStats;
    },
    staleTime: 30000,
  });

  const stats = data?.stats;
  const displayName = user?.role === 'admin' ? 'Admin' : (user?.phoneNumber || 'User');

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: '#3b82f6', bg: '#3b82f615' },
    { label: 'Total Recruiters', value: stats?.totalRecruiters ?? 0, icon: UserCheck, color: '#8b5cf6', bg: '#8b5cf615' },
    { label: 'Total Jobs', value: stats?.totalJobs ?? 0, icon: Briefcase, color: '#22c55e', bg: '#22c55e15' },
    { label: 'Total Applications', value: stats?.totalApplications ?? 0, icon: FileSpreadsheet, color: '#ef4444', bg: '#ef444415' },
  ];

  const quickActions = [
    { label: 'Recruiters', href: ROUTES.RECRUITERS },
    { label: 'Jobs', href: ROUTES.JOBS },
    { label: 'Applications', href: ROUTES.APPLICATIONS },
    { label: 'Users', href: ROUTES.USERS },
  ];

  return (
    <div>
      <style jsx>{`
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }
        .dashboard-charts-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }
        .dashboard-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }
        @media (max-width: 900px) {
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-charts-grid,
          .dashboard-actions-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ─── Welcome Banner ─── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
          Welcome back, {displayName} 👋
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Here&apos;s what&apos;s happening with your job portal today.
        </p>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="dashboard-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: '#ffffff', borderRadius: 8, padding: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: card.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <card.icon size={22} color={card.color} />
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 2px' }}>{card.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1.2 }}>
                {isLoading ? '—' : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts Row ─── */}
      <div className="dashboard-charts-grid">
        {/* Applications Overview Area Chart */}
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '24px',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px' }}>
            Applications Overview
          </h2>
          {isLoading ? (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data?.applicationTrend || []}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8125rem' }}
                />
                <Area
                  type="monotone" dataKey="count" name="Applications"
                  stroke="#3b82f6" strokeWidth={2}
                  fillOpacity={1} fill="url(#colorApps)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Users Distribution Donut Chart */}
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '24px',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px' }}>
            Users Distribution
          </h2>
          {isLoading ? (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.userDistribution || []}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={4}
                  dataKey="count" nameKey="role"
                >
                  {(data?.userDistribution || []).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: '#1e293b', fontSize: '0.8125rem', textTransform: 'capitalize' }}>{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8125rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ─── Quick Actions & Recent Activity ─── */}
      <div className="dashboard-actions-grid">
        {/* Quick Actions */}
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '24px',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '12px 16px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                  color: '#1e293b', fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '24px',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px' }}>
            Recent Activity
          </h2>
          {isLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading...</p>
          ) : (data?.recentActivity?.length ?? 0) > 0 ? (
            <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0 }}>
              {data?.recentActivity.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 8 }}>
                  {item.message}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No recent activity</p>
          )}
        </div>
      </div>

      {/* ─── Recent Jobs Table ─── */}
      <div style={{
        background: '#ffffff', borderRadius: 8, padding: '24px',
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
            Recent Jobs
          </h2>
          <Link href={ROUTES.JOBS} style={{ fontSize: '0.8125rem', color: '#3b82f6', textDecoration: 'none' }}>
            View All
          </Link>
        </div>
        {isLoading ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading...</p>
        ) : (data?.recentJobs?.length ?? 0) > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>
                    <span className={`badge badge-${job.status === 'active' ? 'applied' : job.status === 'pending' ? 'pending' : 'rejected'}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No jobs posted yet</p>
        )}
      </div>
    </div>
  );
}
