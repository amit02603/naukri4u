'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'sonner';
import { KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Form validation schema
const verifyFormSchema = z.object({
  otp: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'Verification code must contain only digits'),
});

type VerifyFormValues = z.infer<typeof verifyFormSchema>;

export default function VerifyPage() {
  const router = useRouter();
  const { loginWithToken, isLoading: isAuthLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneNumber] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('temp_phone') || '';
    }
    return '';
  });
  const [resendCountdown, setResendCountdown] = useState(60); // 60 seconds resend cooldown

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    // Safely verify that confirmationResult exists, otherwise go back
    if (typeof window !== 'undefined' && !window.confirmationResult) {
      toast.error('No login session found. Please enter your phone number again.');
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  useEffect(() => {
    // Resend countdown timer
    if (resendCountdown <= 0) {
      return;
    }
    const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const onSubmit = async (values: VerifyFormValues) => {
    setIsVerifying(true);
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error('No active verification session. Please request OTP again.');
      }

      // 1. Verify OTP with Firebase and fetch credentials
      const userCredential = await confirmationResult.confirm(values.otp);
      
      // 2. Fetch Firebase ID Token
      const firebaseIdToken = await userCredential.user.getIdToken();

      // 3. Authenticate with custom backend
      const success = await loginWithToken(firebaseIdToken);

      if (success) {
        // Clear phone from session storage on success
        sessionStorage.removeItem('temp_phone');
        toast.success('Session authenticated successfully!');
      }
    } catch (error: unknown) {
      console.warn('OTP confirmation failed:', error);
      const err = error as { code?: string; message?: string };
      
      let friendlyMessage = 'OTP Verification failed. Please check the code and try again.';
      
      if (err.code === 'auth/invalid-verification-code' || err.message?.includes('invalid-verification-code')) {
        friendlyMessage = 'Invalid code. Please double-check and enter the correct OTP.';
      } else if (err.code === 'auth/code-expired' || err.message?.includes('code-expired')) {
        friendlyMessage = 'This verification code has expired. Please go back and request a new one.';
      } else if (err.code === 'auth/session-expired' || err.message?.includes('session-expired')) {
        friendlyMessage = 'Your verification session has expired. Please go back and request a new code.';
      }

      toast.error(friendlyMessage, { duration: 5000 });
    } finally {
      setIsVerifying(false);
    }
  };

  const isLoading = isVerifying || isAuthLoading;

  return (
    <div style={{
      background: '#ffffff', borderRadius: 12, padding: '40px 36px',
      border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>

      {/* ─── Go Back Link ─── */}
      <Link
        href={ROUTES.LOGIN}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.875rem', fontWeight: 500, color: '#64748b',
          textDecoration: 'none', marginBottom: 24,
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#3b82f6'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to phone login
      </Link>

      {/* ─── Header ─── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
          Verify Code
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          We sent a 6-digit verification code to{' '}
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{phoneNumber || 'your device'}</span>.
        </p>
      </div>

      {/* ─── Form ─── */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label htmlFor="otp" style={{
            display: 'block', fontSize: '0.875rem', fontWeight: 500,
            color: '#1e293b', marginBottom: 8,
          }}>
            Verification Code (OTP)
          </label>
          <div style={{
            position: 'relative', display: 'flex', borderRadius: 8,
            border: '1px solid #e2e8f0', background: '#ffffff',
          }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <KeyRound className="h-4.5 w-4.5" />
            </span>
            <input
              id="otp"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              disabled={isLoading}
              {...register('otp')}
              style={{
                width: '100%', background: 'transparent',
                padding: '14px 16px 14px 44px', textAlign: 'center',
                fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.3em',
                color: '#1e293b', border: 'none', outline: 'none',
              }}
            />
          </div>

          {/* Validation errors */}
          {errors.otp && (
            <p style={{ marginTop: 6, fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
              {errors.otp.message}
            </p>
          )}
        </div>

        {/* ─── Submit Button ─── */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            display: 'flex', width: '100%', alignItems: 'center',
            justifyContent: 'center', gap: 8, borderRadius: 8,
            background: '#3b82f6', padding: '12px 16px',
            fontSize: '0.875rem', fontWeight: 600, color: '#ffffff',
            border: 'none', cursor: 'pointer',
            transition: 'background 0.15s ease',
            opacity: isLoading ? 0.6 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#2563eb'; }}
          onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#3b82f6'; }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Verifying Code...
            </>
          ) : (
            'Verify & Access'
          )}
        </button>

        {/* ─── Resend timer ─── */}
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          {resendCountdown > 0 ? (
            <span>Resend code in <span style={{ fontWeight: 600, color: '#1e293b' }}>{resendCountdown}s</span></span>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              style={{ fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}
            >
              Resend Code
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
