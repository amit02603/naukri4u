'use client';

import React from 'react';

/**
 * Shared Auth Layout.
 * Responsive split-screen on desktop, stacked layout on mobile devices.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-container">
      <style jsx>{`
        .auth-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }
        .left-pane {
          width: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #283046;
          padding: 32px;
        }
        .right-pane {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          background: #f1f3f6;
        }
        .form-wrapper {
          width: 100%;
          max-width: 420px;
        }
        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column;
          }
          .left-pane {
            width: 100%;
            padding: 24px 16px;
          }
          .right-pane {
            padding: 32px 16px;
          }
        }
      `}</style>

      {/* ─── Left Branding Pane ─── */}
      <div className="left-pane">
        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff' }}>
          Naukri<span style={{ color: '#60a5fa' }}>4U</span>
        </span>
      </div>

      {/* ─── Right Form Pane ─── */}
      <div className="right-pane">
        <div className="form-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
