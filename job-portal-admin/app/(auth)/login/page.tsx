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
    <div style={{
      background: '#ffffff', borderRadius: 12, padding: '40px 36px',
      border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>

      {/* ─── Header ─── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Enter your phone number to receive a one-time OTP code.
        </p>
      </div>

      {/* ─── Form ─── */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label htmlFor="phoneNumber" style={{
            display: 'block', fontSize: '0.875rem', fontWeight: 500,
            color: '#1e293b', marginBottom: 8,
          }}>
            Phone Number
          </label>
          <div style={{
            display: 'flex', borderRadius: 8, overflow: 'hidden',
            border: '1px solid #e2e8f0', background: '#ffffff',
            transition: 'border-color 0.15s ease',
          }}>
            {/* Country code selector */}
            <select
              {...register('countryCode')}
              style={{
                padding: '0 12px', background: '#f8fafc',
                borderRight: '1px solid #e2e8f0', color: '#1e293b',
                fontSize: '0.875rem', fontWeight: 500, border: 'none',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="+91">+91 (IN)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+971">+971 (AE)</option>
              <option value="+61">+61 (AU)</option>
            </select>

            {/* Input field */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: '#94a3b8' }}>
                <Phone className="h-4.5 w-4.5" />
              </span>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="99887 76655"
                disabled={isLoading}
                {...register('phoneNumber')}
                style={{
                  width: '100%', background: 'transparent',
                  padding: '12px 16px 12px 40px', fontSize: '0.875rem',
                  color: '#1e293b', border: 'none', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Validation errors */}
          {errors.phoneNumber && (
            <p style={{ marginTop: 6, fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
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
