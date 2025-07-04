'use client';

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Cancelled</h1>
          <p className="text-gray-600 mt-2">
            Your payment was cancelled and you have not been charged.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            If you experienced any issues during checkout, please try again or contact support.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Link 
            href="/credits" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Try Again
          </Link>
          <Link 
            href="/chat" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Chat
          </Link>
        </div>
      </div>
    </div>
  );
} 