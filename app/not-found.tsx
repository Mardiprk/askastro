'use client';

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function NotFound() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-[#52525B] flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Icon.png" alt="AskAstro Logo" width={32} height={32} className="h-10 w-10" />
              <span className="text-3xl font-eb-garamond text-[#18181B] font-medium">AskAstro</span>
            </Link>
            <div className="flex items-center space-x-6">
              {
                session ? (
                  <button
                    onClick={() => router.push('/chat')}
                    className="bg-[#18181B] text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-gray-200 flex items-center justify-center gap-3"
                  >
                    Go to Chat
                  </button>
                ) : (
                  <button onClick={() => signIn('google')} className="bg-[#1D1616] hover:bg-[#000000] text-[#ffffff] hover:text-[#ffffff] font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-gray-200 flex items-center justify-center gap-3">
                    Login
                  </button>
                )
              }
            </div>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 text-center">
        
        
        <h1 className="text-6xl sm:text-7xl font-eb-garamond font-medium text-[#18181B] mb-4">
          <span className="animated-gradient-text">404</span>
        </h1>
        
        <h2 className="text-3xl sm:text-4xl font-eb-garamond font-medium text-[#18181B] mb-4">
          Lost in the Cosmos
        </h2>
        
        <p className="text-lg text-[#52525B] max-w-md mx-auto mb-8">
          The star map you're looking for seems <br/> to have drifted into another dimension.
        </p>
        
        <button
          onClick={() => router.push('/')}
          className="bg-[#A84A4A] text-white px-8 py-3.5 rounded-full text-lg font-medium hover:bg-[#8a3b3b] transition-colors flex items-center justify-center gap-3 group"
        >
          <span className="font-medium">Return to Earth</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-5 h-5 transform transition-transform group-hover:translate-x-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
        
        {/* CSS for the animated gradient text */}
        <style jsx>{`
          .animated-gradient-text {
            background: linear-gradient(to right, #ff6b6b, #a16bff, #6ba0ff, rgb(255, 107, 107), #ff6bea);
            background-size: 500% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: gradient-shift 8s ease infinite;
          }
          
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>

      {/* Footer */}
      <footer className="bg-[#18181B]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/50">
                © {new Date().getFullYear()} AskAstro. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="text-sm text-white/50 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 