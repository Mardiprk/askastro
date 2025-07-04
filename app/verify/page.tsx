'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReCaptchaComponent from '@/app/components/ReCaptcha';
import { useRecaptcha } from '@/app/hooks/useRecaptcha';

export default function VerifyPage() {
  const router = useRouter();
  const { isVerified, isVerifying, error, verifyToken } = useRecaptcha();

  useEffect(() => {
    if (isVerified) {
      // Set a cookie to remember verification for 1 hour
      document.cookie = 'recaptcha_verified=true; max-age=3600; path=/';
      router.push('/'); // Redirect to home page
    }
  }, [isVerified, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify You&apos;re Human
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please complete the verification below to access the website
          </p>
        </div>

        <div className="mt-8">
          <ReCaptchaComponent onVerify={verifyToken} />
          {error && (
            <div className="mt-2 text-center text-sm text-red-600">
              {error}
            </div>
          )}
          {isVerifying && (
            <div className="mt-2 text-center text-sm text-blue-600">
              Verifying...
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 