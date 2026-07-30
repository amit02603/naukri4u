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
    <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-slate-800">
      
      {/* ─── Go Back Link ─── */}
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to phone login
      </Link>

      {/* ─── Header ─── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">Verify Code</h2>
        <p className="mt-2 text-sm text-slate-400">
          We sent a 6-digit verification code to <span className="font-semibold text-slate-200">{phoneNumber || 'your device'}</span>.
        </p>
      </div>

      {/* ─── Form ─── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-2">
            Verification Code (OTP)
          </label>
          <div className="relative flex rounded-xl bg-slate-900 border border-slate-800 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
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
              className="w-full bg-transparent py-3.5 pl-11 pr-4 text-center text-lg font-bold letter tracking-[0.3em] text-slate-100 placeholder-slate-700 focus:outline-none"
            />
          </div>

          {/* Validation errors */}
          {errors.otp && (
            <p className="mt-2 text-xs text-rose-500 font-medium">
              {errors.otp.message}
            </p>
          )}
        </div>

        {/* ─── Submit Button ─── */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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

        {/* ─── Resend timer trigger ─── */}
        <div className="text-center text-sm text-slate-500">
          {resendCountdown > 0 ? (
            <span>Resend code in <span className="font-semibold text-slate-400">{resendCountdown}s</span></span>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Resend Code
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
