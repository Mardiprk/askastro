'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Script from 'next/script';
import Image from 'next/image';
import CarouselSlide from '../components/CarouselSlide';
import FreeCreditsBanner from '@/components/FreeCreditsBanner';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const slidesCount = 5;

  const faqs = [
    {
      question: "What do I get with my free credits?",
      answer: "Your 30 free credits let you explore detailed birth chart analysis, receive personalized daily horoscopes, and get answers to your specific questions about career, relationships, and personal growth."
    },
    {
      question: "How does the credit system work?",
      answer: "Each chat interaction costs 5 credits. You start with 30 free credits, allowing for 6 in-depth conversations with our AI astrologer. Additional credits can be purchased as needed."
    },
    {
      question: "What should I do if I paid but didn't receive my credits?",
      answer: "If your payment went through but the credits haven't been added to your account, don't worry! Just send us a message on Instagram with your payment details and the email you used to pay, and we'll verify it and get your credits credited to your account as soon as possible."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AskAstro",
    "description": "Your AI-powered astrological guide for personalized cosmic insights and guidance",
    "url": "https://askastro.vercel.app",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "AI-powered astrological readings",
      "Birth chart analysis",
      "Daily horoscopes",
      "Personalized guidance"
    ],
    "faq": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  // Auto rotate slides every 5 seconds
  useEffect(() => {
    const autoPlay = () => {
      setCurrentSlide((current) => (current + 1) % slidesCount);
    };
    
    autoPlayRef.current = setInterval(autoPlay, 5000);
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  // Reset timer when slide is manually changed
  useEffect(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((current) => (current + 1) % slidesCount);
      }, 5000);
    }
  }, [currentSlide]);

  const prevSlide = () => {
    setCurrentSlide((current) => (current - 1 + slidesCount) % slidesCount);
  };

  const nextSlide = () => {
    setCurrentSlide((current) => (current + 1) % slidesCount);
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white text-[#383844] relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[url('/subtle_stars.png')] bg-repeat opacity-5"></div>
        </div>
        
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2 group">
                <Image src="/Icon.png" alt="AskAstro Logo" width={32} height={32} className="h-10 w-10 " />
                <span className="text-3xl font-eb-garamond text-[#18181B] font-medium transition-colors">AskAstro</span>
              </Link>
              <div className="flex items-center space-x-6">
                {
                  session ? (
                    <button onClick={() => signOut()} className="bg-[#A84A4A] hover:bg-[#8a3b3b] text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-[#A84A4A]/20 flex items-center justify-center gap-3">
                      Logout
                    </button>
                  ) : (
                    <button onClick={() => signIn('google')} className="bg-[#18181B] hover:bg-[#18181B] text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-[#A84A4A]/20 flex items-center justify-center gap-3">
                      Login
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="pt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto">
              {/* Hero Section with improved USP */}
              <div className="text-center mb-16 relative">
                <div className="mb-6 flex justify-center">
                  <div className="p-1.5  rounded-full ">
                    <div className="bg-[#A84A4A]/10 text-[#A84A4A] px-4 py-2 rounded-full text-sm font-medium">
                      Your Personal AI Astrologer ✨
                    </div>
                  </div>
                </div>
                
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-eb-garamond font-medium text-[#18181B] mb-6 leading-tight">
                 Discover Your<br/>
                 <span>
                   <span className="animated-gradient-text">Cosmic</span>
                   <span> Destiny</span>
                 </span>
                </h1>
                <p className="text-sm sm:text-lg text-[#52525B] max-w-2xl mx-auto mb-10 leading-relaxed px-5">
                  Unlock personalized astrological insights powered by AI. Get answers to your deepest questions about life, love, career, and purpose.
                </p>

                {/* CSS for the animated gradient text */}
                <style jsx>{`
                  .animated-gradient-text {
                    background: linear-gradient(to right, #ff6b6b, #a16bff, #6ba0ff,rgb(255, 107, 107), #ff6bea);
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

              {/* Auth Section - Improved */}
              <div className="rounded-2xl transition-all duration-300">
                {session ? (
                  <div className="flex justify-center">
                    <button
                      onClick={() => router.push('/chat')}
                      className="bg-gradient-to-r from-[#A84A4A] to-[#8a3b3b] text-white px-8 py-3.5 rounded-full text-lg font-medium hover:from-[#8a3b3b] hover:to-[#A84A4A] transition-all shadow-lg hover:shadow-[#A84A4A]/25 flex items-center justify-center gap-3 group"
                    >
                      <span className="font-medium">Go to Chat</span>
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
                  </div>
                ) : (
                  <FreeCreditsBanner />
                )}
              </div>

              {/* Featured Images Section - Carousel */}
              <div className="mt-24 w-full">
                <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl shadow-2xl">
                  {/* Navigation buttons */}
                  <button 
                    onClick={prevSlide} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-2 text-white shadow-lg transform hover:scale-110 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextSlide} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-2 text-white shadow-lg transform hover:scale-110 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  
                  {/* Carousel Container */}
                  <div className="relative h-[420px] sm:h-[450px]">
                    {/* First Image */}
                    <CarouselSlide 
                      image="/image1.png" 
                      title="Your Stellar Journey"
                      description="Decode your birth chart's mysteries and see how cosmic alignments shape your life's path and inner growth."
                      index={0}
                      currentIndex={currentSlide}
                    />

                    {/* Second Image */}
                    <CarouselSlide 
                      image="/image2.png" 
                      title="Your Daily Star Insights" 
                      description="Get tailored daily horoscopes and astral advice drawn from your personal planetary placements and energies."
                      index={1}
                      currentIndex={currentSlide}
                    />

                    {/* Third Image */}
                    <CarouselSlide 
                      image="/image3.png" 
                      title="Cosmic Clarity Unveiled" 
                      description="Master life's twists with stellar guidance. Our AI blends timeless astrology with today's insights."
                      index={2}
                      currentIndex={currentSlide}
                    />
                    <CarouselSlide 
                      image="/image4.png" 
                      title="Secrets of the Stars" 
                      description="Step into a cosmic marketplace where destiny unfolds. Discover AI-powered astrology, blending ancient wisdom with modern insight to guide your journey."
                      index={3}
                      currentIndex={currentSlide}
                    />
                    <CarouselSlide 
                      image="/image5.png" 
                      title="A Window to the Cosmos" 
                      description="Peer through the lens of destiny. Let our AI-powered astrology reveal the hidden patterns of your life, guiding you through the stars."
                      index={4}
                      currentIndex={currentSlide}
                    />
                  </div>
                </div>
              </div>

              {/* Benefits Section - ENHANCED */}
              <div className="mt-28">
                <div className="text-center mb-14">
                  <div className="inline-block mb-3 px-4 py-1.5 bg-[#A84A4A]/10 text-[#A84A4A] rounded-full text-sm font-medium">
                    Our Advantages
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-eb-garamond font-medium text-[#18181B] mb-4 bg-gradient-to-r from-[#A84A4A] to-[#C96A6A] bg-clip-text text-transparent">
                    Why Choose AskAstro?
                  </h2>
                  <p className="text-lg text-[#52525B] max-w-lg mx-auto">
                    Where ancient wisdom meets modern technology for your cosmic journey
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Benefit 1 */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                    <div className="mb-6 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#A84A4A]/10 flex items-center justify-center shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#A84A4A]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-center text-xl font-medium text-[#18181B] mb-3">24/7 Access</h3>
                    <p className="text-center text-[#52525B] leading-relaxed">Immediate cosmic guidance whenever you need it, no appointment necessary</p>
                  </div>
                  
                  {/* Benefit 2 */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                    <div className="mb-6 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#A84A4A]/10 flex items-center justify-center shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#A84A4A]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-center text-xl font-medium text-[#18181B] mb-3">Custom Insights</h3>
                    <p className="text-center text-[#52525B] leading-relaxed">Personalized readings based on your unique cosmic blueprint and life path</p>
                  </div>
                  
                  {/* Benefit 3 */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                    <div className="mb-6 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#A84A4A]/10 flex items-center justify-center shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#A84A4A]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-center text-xl font-medium text-[#18181B] mb-3">AI-Powered Speed</h3>
                    <p className="text-center text-[#52525B] leading-relaxed">Get instant cosmic guidance with insights delivered in seconds, not days</p>
                  </div>
                </div>
              </div>

              {/* Chat Awareness Section - ENHANCED */}
              <div className="mt-28">
                <div className="bg-gradient-to-br from-[#F3E9E9] to-[#F9F1EE] rounded-3xl p-8 sm:p-10 border border-[#A84A4A]/10 shadow-xl shadow-[#A84A4A]/5">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-md">
                      <div className="w-12 h-12 rounded-full bg-[#A84A4A]/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-[#A84A4A]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-eb-garamond font-medium text-[#18181B] mb-4">Your Private Cosmic Journey</h3>
                    <p className="text-[#52525B] max-w-2xl mx-auto leading-relaxed text-lg">
                      Each chat session is a fresh beginning, like a new constellation appearing in the night sky. Your conversations with our AI astrologer are private and temporary, staying visible only while you're in the chat. When you refresh or navigate away, a new cosmic journey begins.
                    </p>
                  </div>
                </div>
              </div>

              {/* How It Works Section - ENHANCED */}
              <div className="mt-28">
                <div className="text-center mb-14">
                  <div className="inline-block mb-3 px-4 py-1.5 bg-[#A84A4A]/10 text-[#A84A4A] rounded-full text-sm font-medium">
                    Simple Process
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-eb-garamond font-medium text-[#18181B] mb-4 bg-gradient-to-r from-[#A84A4A] to-[#C96A6A] bg-clip-text text-transparent">
                    How It Works
                  </h2>
                  <p className="text-lg text-[#52525B] max-w-lg mx-auto">
                    Your cosmic journey in three simple steps
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  {/* Add hover translate and ensure transition */} 
                  <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-lg relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#A84A4A]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center mb-5">
                        <div className="w-12 h-12 rounded-full bg-[#A84A4A]/10 flex items-center justify-center mr-4 shadow-inner">
                          <span className="text-[#A84A4A] font-semibold text-xl">1</span>
                        </div>
                        <h3 className="text-xl font-semibold text-[#18181B]">Sign Up</h3>
                      </div>
                      <div className="pl-2">
                        <p className="text-[#52525B] leading-relaxed">Create your account and receive 30 free credits instantly to begin your cosmic journey</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  {/* Add hover translate and ensure transition */}
                  <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-lg relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#A84A4A]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center mb-5">
                        <div className="w-12 h-12 rounded-full bg-[#A84A4A]/10 flex items-center justify-center mr-4 shadow-inner">
                          <span className="text-[#A84A4A] font-semibold text-xl">2</span>
                        </div>
                        <h3 className="text-xl font-semibold text-[#18181B]">Ask Questions</h3>
                      </div>
                      <div className="pl-2">
                        <p className="text-[#52525B] leading-relaxed">Chat naturally about your life, love, career, or future path with your AI astrologer</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  {/* Add hover translate and ensure transition */}
                  <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-lg relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#A84A4A]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center mb-5">
                        <div className="w-12 h-12 rounded-full bg-[#A84A4A]/10 flex items-center justify-center mr-4 shadow-inner">
                          <span className="text-[#A84A4A] font-semibold text-xl">3</span>
                        </div>
                        <h3 className="text-xl font-semibold text-[#18181B]">Get Guidance</h3>
                      </div>
                      <div className="pl-2">
                        <p className="text-[#52525B] leading-relaxed">Receive immediate astrological insights tailored specifically to your unique cosmic blueprint</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section - ENHANCED */}
              <div className="mt-28">
                <div className="text-center mb-14">
                  <div className="inline-block mb-3 px-4 py-1.5 bg-[#A84A4A]/10 text-[#A84A4A] rounded-full text-sm font-medium">
                    Common Questions
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-eb-garamond font-medium text-[#18181B] mb-4 bg-gradient-to-r from-[#A84A4A] to-[#C96A6A] bg-clip-text text-transparent">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-lg text-[#52525B] max-w-lg mx-auto">
                    Everything you need to know about your cosmic journey
                  </p>
                </div>
                <div className="space-y-0 max-w-3xl mx-auto divide-y divide-gray-200">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-0 overflow-hidden py-2">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full px-4 py-5 text-left flex items-center justify-between"
                      >
                        <span className="font-medium text-[#18181B] text-lg">{faq.question}</span>
                        <div className={`text-[#A84A4A] transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {openFaq === index && (
                        <div className="px-4 pb-6 pt-0 text-[#52525B] leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Call-to-Action Section - NEW */}
        <div className="mt-28 mb-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#18181B] to-[#2F2F3B] rounded-3xl overflow-hidden relative shadow-2xl">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#A84A4A]/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute right-0 bottom-0">
                  <svg width="280" height="280" viewBox="0 0 512 512" className="text-white opacity-5">
                    <path fill="currentColor" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
              </div>
  
              <div className="relative z-10 px-8 py-16 sm:px-12 sm:py-20 md:py-24 text-center">
                
                <h2 className="text-4xl sm:text-5xl font-eb-garamond font-medium text-white mb-6 max-w-3xl mx-auto leading-tight">
                  Discover What the Stars Have Planned for You
                </h2>
                <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
                  Join thousands who have gained clarity and insight through our AI-powered astrological guidance.
                </p>
  
                {session ? (
                  <button
                    onClick={() => router.push('/chat')}
                    className="bg-[#A84A4A] hover:bg-[#8a3b3b] text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-xl hover:shadow-[#A84A4A]/25 flex items-center justify-center gap-3 group mx-auto"
                  >
                    <span className="font-medium">Start Your Reading</span>
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
                  <button
                    onClick={() => signIn('google')}
                    className="bg-[#A84A4A] hover:bg-[#8a3b3b] text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-xl hover:shadow-[#A84A4A]/25 flex items-center justify-center gap-3 group mx-auto"
                  >
                    <span className="font-medium">Sign In & Get 30 Free Credits</span>
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
                )}
                
                <p className="text-white/60 text-sm mt-6">
                  No credit card required. Start with 30 free credits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - IMPROVED */}
        <footer className="bg-gradient-to-br from-[#161616] to-[#252529]">
          <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Left Column */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Image src="/Icon.png" alt="AskAstro Logo" width={40} height={40} className="h-10 w-10" />
                    <h3 className="font-eb-garamond text-4xl text-white">AskAstro</h3>
                  </div>
                  <p className="text-white/60 max-w-md leading-relaxed">
                    Your trusted AI-powered astrological guide for personalized cosmic insights and guidance on life's journey.
                  </p>
                </div>

                {session ? (
                  <button
                    onClick={() => router.push('/chat')}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#A84A4A] to-[#8a3b3b] hover:bg-gradient-to-r hover:from-[#8a3b3b] hover:to-[#A84A4A] text-white px-7 py-3.5 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-[#A84A4A]/25 flex items-center justify-center sm:justify-start gap-2 group"
                  >
                    Start Your Reading
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={2} 
                      stroke="currentColor" 
                      className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#A84A4A] to-[#8a3b3b] hover:bg-gradient-to-r hover:from-[#8a3b3b] hover:to-[#A84A4A] text-white px-7 py-3.5 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-[#A84A4A]/25 flex items-center justify-center sm:justify-start gap-2"
                  >
                    Sign In & Begin
                  </button>
                )}
              </div>
              
              {/* Right Column */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white font-medium mb-6">Explore</h4>
                  <ul className="space-y-4">
                    <li>
                      <Link href="/about" className="text-white/60 hover:text-white transition-colors">
                        About Us
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-6">Connect</h4>
                  <ul className="space-y-4">
                    <li>
                      <a href="https://x.com/AskAstro_5" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Twitter
                      </a>
                    </li>
                    <li>
                      <a href="https://www.instagram.com/ask_astro.5/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                        Instagram
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 mt-16 pt-10">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <p className="text-white/50">
                  © {new Date().getFullYear()} AskAstro. All rights reserved.
                </p>
                <div className="flex items-center gap-8">
                  <Link href="/terms" className="text-white/50 hover:text-white transition-colors">
                    Terms
                  </Link>
                  <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">
                    Privacy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
