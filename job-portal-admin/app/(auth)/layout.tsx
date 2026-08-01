import React from 'react';

/**
 * Shared Auth Layout.
 *
 * Clean split-screen: dark navy left pane with just the logo,
 * light right pane for the form.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* ─── Left Branding Pane ─── */}
      <div style={{
        width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#283046',
      }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
          Naukri<span style={{ color: '#60a5fa' }}>4U</span>
        </span>
      </div>

      {/* ─── Right Form Pane ─── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px', background: '#f1f3f6',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
