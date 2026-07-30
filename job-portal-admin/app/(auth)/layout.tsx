import React from 'react';

/**
 * Shared Auth Layout.
 * 
 * Provides a split-screen premium responsive design:
 * - Left pane: Visual decorative pane with blur effects, gradients, and product branding.
 * - Right pane: Focus container for login and OTP forms.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row overflow-hidden bg-slate-950">
      
      {/* ─── Ambient Glow Highlights ─── */}
      <div className="absolute top-[-20%] left-[-20%] h-[70vw] w-[70vw] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[60vw] w-[60vw] rounded-full bg-blue-500/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* ─── Left Visual Pane (lg screen only) ─── */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex border-r border-slate-900 bg-slate-950/50 backdrop-blur-3xl">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            N
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">naukri<span className="text-emerald-500">4U</span></span>
        </div>

        {/* Decorative Feature Focus */}
        <div className="my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Enterprise Console
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-50">
            Unleash the Power of Structured Recruitment.
          </h1>
          <p className="text-base leading-relaxed text-slate-400">
            Manage candidates, verify recruiters, monitor applications, and publish job listings with granular RBAC permissions. Secure, real-time platform statistics at your fingertips.
          </p>
        </div>

        {/* Console Footnote */}
        <div className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} naukri4U. All rights reserved.
        </div>
      </div>

      {/* ─── Right Form Pane ─── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8 z-10">
        <div className="w-full max-w-md">
          {/* Logo header (only visible on mobile screens) */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-slate-950">
              N
            </div>
            <span className="text-lg font-bold text-slate-100">naukri4U</span>
          </div>

          {/* Form Container */}
          {children}
        </div>
      </div>
    </div>
  );
}
