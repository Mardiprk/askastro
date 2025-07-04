'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from "next-auth/react";

export default function About() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-[#383844] relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/subtle_stars.png')] bg-repeat opacity-5"></div>
      </div>
      
      {/* Main content */}
      <main className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Link 
              href="/" 
              className="inline-flex items-center text-[#52525B] hover:text-[#A84A4A] mb-10 group transition-colors"
            >
              <svg 
                className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>

            {/* Page Header */}
            <div className="mb-12 text-center">
              <div className="inline-block mb-3 px-4 py-1.5 bg-[#A84A4A]/10 text-[#A84A4A] rounded-full text-sm font-medium">
                Our Story
              </div>
              <h1 className="text-4xl sm:text-5xl font-eb-garamond text-[#18181B] mb-4">About AskAstro</h1>
              <p className="text-lg text-[#52525B] max-w-2xl mx-auto">
                Where ancient astrological wisdom meets modern technology
              </p>
            </div>
            
            {/* Content */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl mb-10">
              <div className="prose prose-lg max-w-none">
                <p className="text-[#52525B] mb-8 leading-relaxed">
                  AskAstro is your modern gateway to astrological wisdom, combining ancient knowledge with cutting-edge AI technology. Our platform offers personalized astrological insights that help you understand yourself better and navigate life&apos;s journey with confidence.
                </p>

                <h2 className="text-2xl font-eb-garamond text-[#18181B] mt-10 mb-4">Our Mission</h2>
                <p className="text-[#52525B] mb-8 leading-relaxed">
                  We believe that astrology, when combined with modern technology, can provide valuable insights for personal growth and self-discovery. Our mission is to make astrological guidance accessible, accurate, and personalized for everyone.
                </p>

                <h2 className="text-2xl font-eb-garamond text-[#18181B] mt-10 mb-4">What We Offer</h2>
                <div className="bg-gradient-to-br from-[#F9F8FC] to-[#F9F1EE] rounded-xl p-6 mb-8">
                  <ul className="space-y-4 text-[#52525B]">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#A84A4A]/10 flex items-center justify-center mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#A84A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Personalized birth chart analysis</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#A84A4A]/10 flex items-center justify-center mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#A84A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Daily horoscopes tailored to your chart</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#A84A4A]/10 flex items-center justify-center mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#A84A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>AI-powered astrological insights</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#A84A4A]/10 flex items-center justify-center mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#A84A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Comprehensive astrological reports</span>
                    </li>
                  </ul>
                </div>

                <h2 className="text-2xl font-eb-garamond text-[#18181B] mt-10 mb-4">Our Technology</h2>
                <p className="text-[#52525B] mb-8 leading-relaxed">
                  We leverage advanced AI technology to provide accurate and personalized astrological readings. Our system combines traditional astrological principles with modern computational methods to deliver insights that are both meaningful and practical.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-[#18181B] to-[#2F2F3B] rounded-xl p-8 shadow-lg text-center">
              <h2 className="text-2xl sm:text-3xl font-eb-garamond font-medium text-white mb-4">Begin Your Cosmic Journey</h2>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Sign up for free and receive 30 credits to explore our services. Experience the power of AI-enhanced astrological guidance.
              </p>
              {
                session ? (
                  <button onClick={() => router.push('/chat')} className="bg-[#A84A4A] hover:bg-[#8a3b3b] text-white px-8 py-3 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-[#A84A4A]/25 flex items-center justify-center gap-3 mx-auto">
                    <span>Start Your Reading</span>
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
                ) : (
                  <button onClick={() => signIn('google')} className="bg-[#A84A4A] hover:bg-[#8a3b3b] text-white px-8 py-3 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-[#A84A4A]/25 flex items-center justify-center gap-3 mx-auto">
                    <span>Sign In & Get 30 Free Credits</span>
                  </button>
                )
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 