"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SuccessPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your credits have been added to your account. You can now continue using our services.
          </p>

          <div className="space-y-3 w-full">
            <Link 
              href="/chat" 
              className="block w-full bg-[#A84A4A] text-white py-2 px-4 rounded-md text-center hover:bg-[#8a3b3b] transition-colors"
            >
              Return to Chat
            </Link>
            
            <Link 
              href="/credits" 
              className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-center hover:bg-gray-200 transition-colors"
            >
              Purchase More Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 