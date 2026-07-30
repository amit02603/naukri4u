'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'sonner';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';

// Form validation schema
const phoneFormSchema = z.object({
  countryCode: z.string().min(1, 'Required'),
  phoneNumber: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;

// Extend Window interface for confirmationResult
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      countryCode: '+91', // Default to India country code
      phoneNumber: '',
    },
  });

  useEffect(() => {
    // Initialize reCAPTCHA Verifier on mount
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: () => {
              // reCAPTCHA solved, direct sign-in flow
            },
            'expired-callback': () => {
              toast.error('reCAPTCHA expired. Please request OTP again.');
              setIsLoading(false);
            },
          },
        );
      } catch (error) {
        console.error('Failed to initialize RecaptchaVerifier', error);
      }
    }

    return () => {
      // Clear verifier on unmount
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
        } catch {
          // Ignore clear errors
        }
      }
    };
  }, []);

  const onSubmit = async (values: PhoneFormValues) => {
    setIsLoading(true);
    const fullPhoneNumber = `${values.countryCode}${values.phoneNumber}`;

    try {
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA verifier not initialized. Please refresh the page.');
      }

      // Trigger Firebase Phone authentication
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        window.recaptchaVerifier,
      );

      // Save confirmation result in window context to read in verification page
      // eslint-disable-next-line react-hooks/immutability
      window.confirmationResult = confirmationResult;

      // Also store temporary phone number in session storage to display on verify page
      sessionStorage.setItem('temp_phone', fullPhoneNumber);

      toast.success('OTP sent successfully!');
      router.push(ROUTES.VERIFY);
    } catch (error: unknown) {
      console.error('Firebase Auth SMS fail', error);
      const err = error as { code?: string; message?: string };
      
      let friendlyMessage = 'Failed to send OTP. Please verify your phone number and try again.';
      
      if (err.code === 'auth/billing-not-enabled' || err.message?.includes('billing-not-enabled')) {
        friendlyMessage = 'SMS verification is restricted to test numbers in development mode. Please use the registered test phone number (e.g., +919988776655).';
      } else if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        friendlyMessage = 'SMS delivery is disabled for this region in development. Please use the registered test phone number.';
      } else if (err.code === 'auth/too-many-requests' || err.message?.includes('too-many-requests')) {
        friendlyMessage = 'SMS quota exceeded for this phone number. Please try again later or use the test phone number.';
      } else if (err.message?.includes('captcha')) {
        friendlyMessage = 'Security check failed. Please refresh and try again.';
      } else if (err.message?.includes('blocked')) {
        friendlyMessage = 'This phone number has been blocked due to unusual activity.';
      }

      toast.error(friendlyMessage, { duration: 6000 });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-slate-800">
      
      {/* ─── Header ─── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your phone number to receive a one-time OTP code.
        </p>
      </div>

      {/* ─── Form ─── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-300 mb-2">
            Phone Number
          </label>
          <div className="relative flex rounded-xl bg-slate-900 border border-slate-800 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-hidden">
            {/* Country code selector prefix */}
            <select
              {...register('countryCode')}
              className="px-3 bg-transparent border-r border-slate-800 text-slate-300 text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="+91">+91 (IN)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+971">+971 (AE)</option>
              <option value="+61">+61 (AU)</option>
            </select>

            {/* Input field */}
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-3 text-slate-500">
                <Phone className="h-4.5 w-4.5" />
              </span>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="99887 76655"
                disabled={isLoading}
                {...register('phoneNumber')}
                className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
              />
            </div>
          </div>

          {/* Validation errors */}
          {errors.phoneNumber && (
            <p className="mt-2 text-xs text-rose-500 font-medium">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* ─── Hidden reCAPTCHA anchor ─── */}
        <div id="recaptcha-container" ref={recaptchaContainerRef} />

        {/* ─── Submit Button ─── */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              Request OTP
              <ArrowRight className="h-4.5 w-4.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
