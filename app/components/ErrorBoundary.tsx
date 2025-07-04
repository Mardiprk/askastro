'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorType: 'database' | 'general';
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorType: 'general'
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if this is a database connection error
    const isDatabaseError = error.message?.toLowerCase().includes('database') || 
                            error.message?.toLowerCase().includes('connection') ||
                            error.message?.toLowerCase().includes('db');
    
    return { 
      hasError: true,
      errorType: isDatabaseError ? 'database' : 'general'
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.errorType === 'database') {
        return (
          <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="#A84A4A" 
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
                  />
                </svg>
                <h2 className="text-2xl font-eb-garamond font-bold text-gray-800 mb-2">
                  Database Connection Error
                </h2>
                <p className="text-gray-600 mb-6">
                  We're having trouble connecting to our database. This might be due to maintenance or high traffic.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full bg-[#A84A4A] hover:bg-[#8a3b3b] text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <Link 
                  href="/"
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
              <button
                className="bg-[#A84A4A] text-white px-4 py-2 rounded-lg"
                onClick={() => this.setState({ hasError: false })}
              >
                Try again
              </button>
            </div>
          </div>
        );
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 