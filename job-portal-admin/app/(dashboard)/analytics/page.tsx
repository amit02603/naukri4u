'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, ComprehensiveAnalytics } from '../../../services/adminService';
import { Users, UserCheck, Briefcase, TrendingUp, Activity, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

/**
 * Analytics Page — Comprehensive platform analytics & performance reports.
 * Powered by GET /admin/analytics API.
 */

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery<ComprehensiveAnalytics>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await adminService.getAnalytics();
      return res.data as ComprehensiveAnalytics;
    },
    staleTime: 30000,
  });

  const overview = data?.overview;

  const statCards = [
    { label: 'Total Registrations', value: overview?.totalRegistrations ?? 0, icon: Users, color: '#3b82f6', bg: '#3b82f615' },
    { label: 'Active Users', value: overview?.activeUsers ?? 0, icon: TrendingUp, color: '#22c55e', bg: '#22c55e15' },
    { label: 'Recruiter Growth', value: overview?.totalRecruiters ?? 0, icon: UserCheck, color: '#8b5cf6', bg: '#8b5cf615' },
    { label: 'Employee Base', value: overview?.totalEmployees ?? 0, icon: Briefcase, color: '#ef4444', bg: '#ef444415' },
  ];

  return (
    <div>
      {/* ─── Page Title ─── */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ margin: '0 0 6px' }}>Comprehensive Analytics</h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Real-time reports on user growth, daily activity, job posting statistics, and application conversion rates.
        </p>
      </div>

      {/* ─── Metric Stat Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: '#ffffff', borderRadius: 8, padding: '24px',
            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16,
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

      {/* ─── Charts Section 1: Growth & Daily Activity ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 28 }}>
        
        {/* User Activity & Applications (30 Days Bar Chart) */}
        <div style={{ background: '#ffffff', borderRadius: 8, padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Activity size={20} color="#3b82f6" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
              Daily User Activity (Last 30 Days)
            </h2>
          </div>
          {isLoading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.dailyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} interval={4} />
                <YAxis stroke="#94a3b8" fontSize= {12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8125rem' }} />
                <Bar dataKey="activeUsers" name="Active Users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="applications" name="Applications Submitted" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Growth Trend Area Chart */}
        <div style={{ background: '#ffffff', borderRadius: 8, padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <BarChart2 size={20} color="#8b5cf6" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
              Monthly Growth Trends
            </h2>
          </div>
          {isLoading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.growth?.employeeTrend || []}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8125rem' }} />
                <Area type="monotone" dataKey="count" name="New Growth" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ─── Charts Section 2: Job & Application Breakdowns ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* Job Status Breakdown */}
        <div style={{ background: '#ffffff', borderRadius: 8, padding: '24px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px' }}>
            Job Postings Breakdown
          </h2>
          {isLoading ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data?.jobStats || []}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  paddingAngle={4} dataKey="count" nameKey="status"
                >
                  {(data?.jobStats || []).map((_entry, index) => (
                    <Cell key={`cell-job-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend formatter={(value: string) => <span style={{ color: '#1e293b', fontSize: '0.8125rem', textTransform: 'capitalize' }}>{value}</span>} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8125rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Application Status Conversion Funnel */}
        <div style={{ background: '#ffffff', borderRadius: 8, padding: '24px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px' }}>
            Application Status Funnel
          </h2>
          {isLoading ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data?.applicationStats || []}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  paddingAngle={2} dataKey="count" nameKey="status"
                >
                  {(data?.applicationStats || []).map((_entry, index) => (
                    <Cell key={`cell-app-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Legend formatter={(value: string) => <span style={{ color: '#1e293b', fontSize: '0.8125rem', textTransform: 'capitalize' }}>{value}</span>} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8125rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
