import React from 'react';
import { signIn } from 'next-auth/react';

const FreeCreditsBanner = () => {
  return (
    <button 
      onClick={() => signIn('google')}
      className="group relative flex items-center justify-center w-full max-w-xs mx-auto py-3 px-5 rounded-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-0"
    >
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-85"
        style={{
          backgroundSize: '300% 100%',
          animation: 'gradient-shift 8s ease infinite',
        }}
      />
      
      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-15 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px'
        }}
      />
      
      {/* Semi-transparent background for better text visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      {/* Star icon */}
      <div className="flex-shrink-0 mr-2 relative">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] animate-pulse">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" fillOpacity="0.9" />
        </svg>
      </div>
      
      {/* Content */}
      <div className="text-white relative font-medium ">
        Start chatting <span className="font-bold">- 30 free credits</span>
      </div>
      
      {/* Arrow icon */}
      <svg 
        className="w-4 h-4 ml-2 text-white relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] transition-transform group-hover:translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>

      {/* CSS for the animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </button>
  );
};

export default FreeCreditsBanner; 