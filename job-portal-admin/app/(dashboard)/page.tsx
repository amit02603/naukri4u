'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Phone, Calendar, CheckCircle2, UserCheck, HardDrive, Key } from 'lucide-react';

export default function DashboardPage() {
  const { user, accessToken } = useAuth();

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const metadataCards = [
    {
      title: 'Authentication ID',
      value: user?.firebaseUid || 'N/A',
      desc: 'Unique Firebase UID',
      icon: Key,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Phone Number',
      value: user?.phoneNumber || 'N/A',
      desc: 'Associated login identifier',
      icon: Phone,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Current Role',
      value: user?.role || 'No Role Assigned',
      desc: 'RBAC Permission Level',
      icon: Shield,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-8 border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl"></div>
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <UserCheck className="h-3.5 w-3.5" />
            Authenticated Session Active
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-50">
            Welcome to the Console
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-400">
            You are authenticated securely with Firebase Phone OTP. Below is the active token and session payload for verification.
          </p>
        </div>
      </div>

      {/* ─── Session Metadata Cards ─── */}
      <div className="grid gap-6 md:grid-cols-3">
        {metadataCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-6 space-y-4 shadow-sm hover:scale-[1.01] transition-transform`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">{card.title}</span>
              <span className={`p-2 rounded-lg bg-slate-950/40 border border-slate-900 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200 truncate" title={card.value}>
                {card.value}
              </h3>
              <p className="text-xs text-slate-500">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Session Payload inspection ─── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User profile detail details */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-900 pb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Session Profile Details
          </h2>
          <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
            <div className="border-b border-slate-900/50 pb-2 sm:col-span-1">
              <dt className="text-xs text-slate-500 font-medium">User Database ID</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-350">{user?.id}</dd>
            </div>
            <div className="border-b border-slate-900/50 pb-2 sm:col-span-1">
              <dt className="text-xs text-slate-500 font-medium">Account Status</dt>
              <dd className="mt-1 text-sm font-semibold text-emerald-400 capitalize">
                {user?.status}
              </dd>
            </div>
            <div className="border-b border-slate-900/50 pb-2 sm:col-span-1">
              <dt className="text-xs text-slate-500 font-medium">Profile Completed</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-350">
                {user?.isProfileCompleted ? 'Yes' : 'No (Requires onboarding)'}
              </dd>
            </div>
            <div className="border-b border-slate-900/50 pb-2 sm:col-span-1">
              <dt className="text-xs text-slate-500 font-medium">Registration Date</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-350 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {formattedDate}
              </dd>
            </div>
          </dl>
        </div>

        {/* Live Token inspector */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-900 pb-3 flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-emerald-500" />
            JWT Access Token (Decrypted)
          </h2>
          <div className="flex-1">
            <textarea
              readOnly
              value={accessToken || ''}
              className="w-full h-32 rounded-xl bg-slate-950/80 border border-slate-900 p-4 font-mono text-[10px] text-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            This token is updated automatically in the background using the sliding expiration rotation protocol.
          </p>
        </div>
      </div>
    </div>
  );
}
