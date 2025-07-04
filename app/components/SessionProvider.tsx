'use client';

import { SessionProvider as Provider } from "next-auth/react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  session: Session | null;
};

export default function SessionProvider({ children, session }: Props) {
  const [isErrorHandled, setIsErrorHandled] = useState(false);

  useEffect(() => {
    // Track if there's an authentication error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasError = urlParams.has('error');
    
    if (hasError && !isErrorHandled) {
      setIsErrorHandled(true);
      
      // Clear any local storage or cookies related to authentication
      try {
        // Clear session cookie by setting expiration in the past
        document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Clear any local storage items
        localStorage.clear();
        sessionStorage.clear();
        
        // Refresh the page to get a clean session
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } catch (e) {
        console.error("Failed to clear session data:", e);
      }
    }
  }, [isErrorHandled]);

  return (
    <Provider 
      session={session} 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </Provider>
  );
} 