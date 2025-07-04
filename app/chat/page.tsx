'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DOBInput } from '@/components/ui/dob-input';
import { getZodiacSign } from '@/app/lib/zodiac';

type MessageRole = 'assistant' | 'user' | 'system';

interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
  isTypingIndicator?: boolean;
}

export default function Chat() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(session?.user?.credits || 0);
  const [showSettings, setShowSettings] = useState(false);
  const [currentAstrologer, setCurrentAstrologer] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSubmissionTimeRef = useRef<number>(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [showDobModal, setShowDobModal] = useState(false);
  const [userDob, setUserDob] = useState<string | null>(null);
  const [userZodiac, setUserZodiac] = useState<string | null>(null);

  const astrologers = [
    { id: 1, name: "Sarah" },
    { id: 2, name: "Alice" },
    { id: 3, name: "Emma" },
  ];

  // Function to get random astrologer
  const getRandomAstrologer = useCallback(() => {
    return Math.floor(Math.random() * 3) + 1;
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setCurrentAstrologer(getRandomAstrologer());
    }
  }, [messages.length, getRandomAstrologer]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Replace the fetchInitialMessage function with this new function
  const getInitialWelcomeMessage = useCallback(() => {
    // Extract first name from the user's full name
    const fullName = session?.user?.name || '';
    const firstName = fullName.split(' ')[0];
    
    // Array of welcome message templates
    const welcomeMessages = [
      `Hey ${firstName}! 🌟 Welcome to our stellar chat universe! I'm your cosmic companion, ready to explore the stars with you. What's your zodiac sign, and is there anything special you'd like to uncover about your horoscope or astrology?`,
      
      `Greetings, ${firstName}! ✨ The stars have drawn you here for a purpose. As your personal AI astrologer, I'm here to unravel the celestial secrets written just for you. What's sparking your curiosity today?`,
      
      `Welcome to AskAstro, ${firstName}! 🌟 The heavens are aligning to share their wisdom with you. Tell me your zodiac sign, and let's embark on a cosmic adventure together!`,
      
      `${firstName}, so glad you've arrived! ✨ The universe is brimming with mysteries for us to explore. Share your zodiac sign, and I'll reveal what the stars have in store for you.`,
      
      `Hi ${firstName}! 🌟 I've been eagerly awaiting your arrival. As your AI astrologer, I'm here to guide you through life's journey with the timeless wisdom of the stars. Where should we start?`,
      
      `The cosmos welcomes you, ${firstName}! ✨ Your astrological adventure begins now. Whether it's love, career, or self-discovery, I'm here to light the way with stellar insights.`,
      
      `${firstName}, step into your cosmic consultation! 🌟 The planets are whispering, and I'm here to decode their messages for you. What part of your life are you curious to explore astrologically?`,
      
      `Cosmic hello, ${firstName}! ✨ Your stars are ready to shine their light on you. As your AI astrologer, I'm thrilled to unveil what the universe has planned. Shall we start with your zodiac sign?`,
      
      `Welcome aboard, ${firstName}! 🌟 The constellations are eager to share their tales with you. I'm your AI astrologer, here to interpret the celestial patterns shaping your life. What's on your mind first?`,
      
      `${firstName}, thrilled you're here! ✨ The stars' alignment right now is perfect for some astrological magic. What cosmic questions are swirling in your thoughts today?`
    ];
    
    // Select a random welcome message
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    return welcomeMessages[randomIndex];
  }, [session?.user?.name]);

  // Replace the useEffect section that calls fetchInitialMessage with this
  useEffect(() => {
    if (messages.length === 0 && session?.user) {
      const welcomeMessage = getInitialWelcomeMessage();
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      }]);
    }
  }, [session?.user, messages.length, getInitialWelcomeMessage]);

  useEffect(() => {
    if (!showSettings) {
      scrollToBottom();
    }
  }, [messages, showSettings, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
      };

      adjustHeight();

      // Add resize event listener to handle window resizing
      window.addEventListener('resize', adjustHeight);

      // Clean up event listener on unmount
      return () => {
        window.removeEventListener('resize', adjustHeight);
      };
    }
  }, [input]);

  // Improved scroll functions
  const scrollToBottom = () => {
    if (messagesEndRef.current && !showSettings) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  // Force immediate scroll for critical moments
  const scrollToBottomForce = () => {
    if (messagesEndRef.current && !showSettings) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        // First immediate scroll
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Then use setTimeout for a more reliable second scroll
        setTimeout(() => {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'auto'
          });
        }, 0);
      }
    }
  };

  // Monitor all changes that require scrolling
  useEffect(() => {
    if (!showSettings) {
      // Short delay to ensure content has rendered
      setTimeout(scrollToBottom, 10);
      // Additional scroll for slower devices
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, showSettings, isLoading]);

  // More aggressive scrolling when new messages are added
  useEffect(() => {
    if (messages.length > 0 && !showSettings) {
      // First force scroll immediately
      scrollToBottomForce();
      
      // Then use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        scrollToBottom();
        // Additional delayed scrolls for reliability
        setTimeout(scrollToBottom, 150);
        setTimeout(scrollToBottom, 500);
      });
    }
  }, [messages.length, showSettings]);

  // Add a mutation observer to track content changes in the message area
  useEffect(() => {
    if (!messagesEndRef.current || showSettings) return;
    
    const chatContainer = messagesEndRef.current.parentElement;
    if (!chatContainer) return;

    // Create a mutation observer to detect content changes
    const observer = new MutationObserver(() => {
      scrollToBottomForce();
    });

    // Start observing
    observer.observe(chatContainer, { 
      childList: true, 
      subtree: true,
      characterData: true 
    });

    // Cleanup
    return () => observer.disconnect();
  }, [showSettings]);

  const sanitizeInput = (input: string) => {
    // Remove any HTML tags
    return input
      .replace(/<[^>]*>/g, '')
      // Remove potentially dangerous characters
      .replace(/[<>]/g, '')
      // Limit length
      .slice(0, 4096);
  };

  // Add this function to fetch user DOB status
  const checkUserDobStatus = useCallback(async () => {
    if (!session?.user?.email) return;
    
    // Check if we already have the data in sessionStorage
    const cachedData = sessionStorage.getItem(`user_dob_${session.user.email}`);
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        setUserDob(data.dob);
        if (data.dob) {
          setUserZodiac(getZodiacSign(data.dob));
        }
        // If dob_collected is false, we still need to show the modal
        if (!data.dob_collected) {
          setShowDobModal(true);
        }
        return;
      } catch (error) {
        console.error('Error parsing cached DOB data:', error);
        // Continue to fetch from API if parsing fails
      }
    }
    
    try {
      const response = await fetch(`/api/user/check-dob?email=${encodeURIComponent(session.user.email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch DOB status');
      }
      
      const data = await response.json();
      
      // Cache the result in sessionStorage
      sessionStorage.setItem(`user_dob_${session.user.email}`, JSON.stringify(data));
      
      if (data.dob_collected) {
        setUserDob(data.dob);
        if (data.dob) {
          setUserZodiac(getZodiacSign(data.dob));
        }
      } else {
        setShowDobModal(true);
      }
    } catch (error) {
      console.error('Error checking DOB status:', error);
    }
  }, [session?.user?.email]);

  // Add useEffect to check DOB status when session is ready
  useEffect(() => {
    if (session?.user) {
      checkUserDobStatus();
    }
  }, [session, checkUserDobStatus]);

  // Modify preprocessUserInput to include zodiac sign
  const preprocessUserInput = (input: string): { displayContent: string; aiContent: string } => {
    // List of zodiac signs to detect
    const zodiacSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    
    // Original input for display
    const displayInput = input;
    
    // Enhanced input for AI processing with metadata
    let processedInput = input;
    
    // Extract zodiac sign information
    let detectedSign = null;
    
    // Check for direct mentions of zodiac signs
    for (const sign of zodiacSigns) {
      const directPattern = new RegExp(`\\b(?:i am|i'm|im|my sign is|i am a|i'm a)\\s+(?:an?\\s+)?${sign}\\b`, 'i');
      if (directPattern.test(input.toLowerCase())) {
        detectedSign = sign.charAt(0).toUpperCase() + sign.slice(1);
        break;
      }
    }
    
    // Check for birth dates if no direct mention found
    if (!detectedSign) {
      // Month to zodiac sign mapping function
      const getZodiacFromDate = (month: number, day: number): string | null => {
        const dates = [
          { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
          { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
          { sign: 'Pisces', start: [2, 19], end: [3, 20] },
          { sign: 'Aries', start: [3, 21], end: [4, 19] },
          { sign: 'Taurus', start: [4, 20], end: [5, 20] },
          { sign: 'Gemini', start: [5, 21], end: [6, 20] },
          { sign: 'Cancer', start: [6, 21], end: [7, 22] },
          { sign: 'Leo', start: [7, 23], end: [8, 22] },
          { sign: 'Virgo', start: [8, 23], end: [9, 22] },
          { sign: 'Libra', start: [9, 23], end: [10, 22] },
          { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
          { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
        ];
        
        for (const date of dates) {
          if (
            (month === date.start[0] && day >= date.start[1]) ||
            (month === date.end[0] && day <= date.end[1])
          ) {
            return date.sign;
          }
        }
        return null;
      };
      
      // Month name to number mapping
      const monthMap: {[key: string]: number} = {
        'january': 1, 'jan': 1, 'february': 2, 'feb': 2, 'march': 3, 'mar': 3,
        'april': 4, 'apr': 4, 'may': 5, 'june': 6, 'jun': 6, 'july': 7, 'jul': 7,
        'august': 8, 'aug': 8, 'september': 9, 'sep': 9, 'sept': 9, 'october': 10, 'oct': 10,
        'november': 11, 'nov': 11, 'december': 12, 'dec': 12
      };
      
      // Match patterns like "born on April 25" or "my birthday is April 25"
      const dateTextPattern = /(?:born|birthday)(?:\s+(?:on|in|is))?\s+(\w+)(?:\s+|-)(\d{1,2})(?:st|nd|rd|th)?/i;
      const dateMatch = input.match(dateTextPattern);
      
      if (dateMatch) {
        const monthName = dateMatch[1].toLowerCase();
        const day = parseInt(dateMatch[2], 10);
        
        if (monthMap[monthName] && day >= 1 && day <= 31) {
          const month = monthMap[monthName];
          const potentialSign = getZodiacFromDate(month, day);
          if (potentialSign) {
            detectedSign = potentialSign;
          }
        }
      }
      
      // Match patterns like MM/DD or M/D
      const numericDatePattern = /\b(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\b/;
      const numericMatch = input.match(numericDatePattern);
      
      if (numericMatch) {
        const month = parseInt(numericMatch[1], 10);
        const day = parseInt(numericMatch[2], 10);
        
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const potentialSign = getZodiacFromDate(month, day);
          if (potentialSign) {
            detectedSign = potentialSign;
          }
        }
      }
    }
    
    // Add metadata for the AI if a sign was detected
    if (detectedSign) {
      processedInput = `${processedInput}\n\n[DETECTED_ZODIAC_SIGN: ${detectedSign}]`;
    }
    
    // Just return the input without additional DOB/zodiac info since we handle this server-side now
    return {
      displayContent: displayInput,
      aiContent: processedInput
    };
  };

  const updateCreditsClientSide = async () => {
    try {
      // Update credits at the end of processing a successful response
      const updateCreditsResponse = await fetch('/api/update-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits: credits - 5
        }),
      });

      if (!updateCreditsResponse.ok) {
        throw new Error('Failed to update credits');
      }

      // Don't update credits in local state again since we already did it
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };

  // Modified handleSubmit function with better error handling for production
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const now = Date.now();
    if (now - lastSubmissionTimeRef.current < 1000) {
      return;
    }
    lastSubmissionTimeRef.current = now;
    
    const sanitizedInput = sanitizeInput(input.trim());
    if (!sanitizedInput) return;

    // Check if user has enough credits
    if (credits < 5) {
      // Redirect to credits page if they don't have enough
      router.push('/credits');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: sanitizedInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Increase timeout to 60 seconds for production reliability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      // Add retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let lastError = null;
      let messageSuccessfullySent = false;

      while (retryCount < maxRetries) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
              messages: [...messages, userMessage].map(msg => ({
                role: msg.role,
                content: msg.content,
              })),
              timestamp: Date.now()
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          const responseText = await response.text();
          let data;
          
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse API response:', responseText);
            throw new Error('Invalid response format from server');
          }
          
          if (!response.ok || data.success === false) {
            throw new Error(data.userMessage || data.error || `Error: ${response.status}`);
          }

          if (data.response) {
            // Split the response into answer and follow-up question
            const parts = data.response.split('\n\n');
            const answer = parts[0].trim();
            
            // Add the answer message
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: answer,
              timestamp: new Date(),
            }]);

            // Add the follow-up question message if it exists
            if (parts.length > 1 && parts[1].trim()) {
              setTimeout(() => {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: parts[1].trim(),
                  timestamp: new Date(),
                }]);
              }, 500);
            }
            
            // Update credits client-side
            setCredits(prev => Math.max(0, prev - 5));
            
            // Mark that the message was successfully sent
            messageSuccessfullySent = true;
            
            // Success - exit retry loop
            break;
          } else {
            throw new Error('Empty response received from the API');
          }
        } catch (error: any) {
          lastError = error;
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            continue;
          }
        }
      }

      // If all retries failed, provide a fallback response
      if (retryCount === maxRetries) {
        const fallbackResponses = [
          "I'm experiencing some cosmic interference right now, but I can still provide you with astrological insights. Let me try again with a different approach.",
          "The stars are a bit cloudy at the moment, but I'll share what I can sense from the celestial energies.",
          "While I'm having some technical difficulties, I can still offer you guidance based on the current astrological alignments."
        ];
        
        const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date(),
        }]);

        // Log the error for debugging
        console.error('All retry attempts failed:', {
          lastError,
          retryCount,
          userMessage: sanitizedInput
        });
      }

      // Update the database with the new credit count if message was sent successfully
      if (messageSuccessfullySent) {
        await updateCreditsClientSide();
      }
    } catch (error: any) {
      console.error('Chat API error:', error);
      
      // Provide a more helpful error message
      let errorMessage = "I'm experiencing some cosmic interference right now, but I can still provide you with astrological insights. Let me try again with a different approach.";
      
      if (error.name === 'AbortError') {
        errorMessage = "The cosmic energies are taking longer than expected to align. I'm still processing your question and will respond shortly.";
      } else if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        if (error.message.includes('cosmic') || error.message.includes('astrology')) {
          errorMessage = error.message;
        }
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      // Ensure scroll to bottom after message is added, with multiple fallbacks
      scrollToBottomForce();
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 500); // Additional delayed scroll for slow connections
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
    }
  };

  const shareWithFriends = async () => {
    const shareUrl = 'https://askastro.vercel.app';
    const shareText = 'Discover your cosmic path with AskAstro - AI-powered astrological insights! Get 30 free credits when you sign up ✨';
    
    // Try to use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AskAstro - Your AI Astrologer',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareStatus('Link copied to clipboard!');
      setTimeout(() => setShareStatus(''), 3000);
    } catch (err) {
      setShareStatus('Failed to copy link. Please try again.');
      setTimeout(() => setShareStatus(''), 3000);
    }
  };

  // Function to scroll to textarea when focused
  const scrollToTextarea = useCallback(() => {
    if (textareaRef.current) {
      // Give a small delay to allow the keyboard to appear
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        // Ensure the chat container is scrolled to bottom
        const chatContainer = messagesEndRef.current?.parentElement;
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 300);
    }
  }, []);

  // Add this to your existing useEffect that handles scrolling
  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current && document.activeElement === textareaRef.current) {
        scrollToTextarea();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollToTextarea]);
  
  // Add viewport meta tag dynamically to prevent zooming on mobile
  useEffect(() => {
    const metaViewport = document.createElement('meta');
    metaViewport.name = 'viewport';
    metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(metaViewport);
    
    return () => {
      document.head.removeChild(metaViewport);
    };
  }, []);

  // Handle DOB submission completion
  const handleDobComplete = useCallback(() => {
    setShowDobModal(false);
    
    // When DOB is successfully updated, update our cache to prevent unnecessary API calls
    if (session?.user?.email) {
      // Update the session storage with the new status
      const cachedData = sessionStorage.getItem(`user_dob_${session.user.email}`);
      if (cachedData) {
        try {
          const data = JSON.parse(cachedData);
          // Mark as collected
          data.dob_collected = true;
          sessionStorage.setItem(`user_dob_${session.user.email}`, JSON.stringify(data));
        } catch (error) {
          console.error('Error updating cached DOB data:', error);
        }
      }
    }
    
    // Still check the current status from the server to get the actual DOB value
    checkUserDobStatus();
  }, [checkUserDobStatus, session?.user?.email]);

  // Remove clearChat to standard implementation
  const clearChat = useCallback(() => {
    setMessages([]);
    // After clearing, we'll fetch the initial message again
    const welcomeMessage = getInitialWelcomeMessage();
    setMessages([{
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    }]);
    setCurrentAstrologer(getRandomAstrologer());
  }, [getInitialWelcomeMessage, getRandomAstrologer]);

  // Modify useEffect to simply set welcome message on component mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (messages.length === 0) {
        // Only set the welcome message if there are no messages
        const welcomeMessage = getInitialWelcomeMessage();
        setMessages([{
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
        }]);
      }
    }
  }, [session?.user, status, getInitialWelcomeMessage, messages.length]);

  // Add a dedicated effect to watch message additions
  useEffect(() => {
    // Only scroll when messages are added (not when first loading)
    if (messages.length > 0 && !showSettings) {
      // Use requestAnimationFrame for better timing with renders
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages.length, showSettings]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F9FB] to-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A84A4A]"></div>
          <p className="mt-4 text-gray-500 font-light">Loading your cosmic connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9FB] via-white to-[#F8F4F4] flex flex-col fixed inset-0">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[url('/subtle_stars.png')] bg-repeat opacity-10"></div>
      </div>
      
      {/* Top Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-md mx-auto">
          <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors transform hover:scale-105 active:scale-95 duration-200"
              >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden relative ring-2 ring-[#A84A4A]/20 shadow-sm">
                <Image
                  src={`/astro/astro${currentAstrologer}.jpg`}
                  alt={`${astrologers.find(a => a.id === currentAstrologer)?.name}`}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  quality={100}
                />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {astrologers.find(a => a.id === currentAstrologer)?.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                  AI Astrologer
                </div>
              </div>
            </div>
          </div>
            <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">{credits}</span>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full transition-colors bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transform hover:scale-105 active:scale-95 duration-200 shadow-sm"
              >
              {showSettings ? (
                // Back button with curved u-turn arrow
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 014 4v1" />
                </svg>
              ) : (
                // Settings cog icon
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              </button>
          </div>
        </div>
      </div>

      {/* Chat Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 custom-scrollbar">
        <div className="max-w-3xl mx-auto px-4">
          {showSettings ? (
            <div className="fixed inset-0 bg-white backdrop-blur-sm z-40 pt-20 pb-24 overflow-y-auto transition-opacity duration-300 ease-in-out">
              <div className="bg-white p-8 rounded-2xl  mx-auto max-w-md">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#18181B]/5 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#18181B]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-medium text-[#18181B] mb-1">Your Account</h2>
                  <p className="text-sm text-gray-500">{session?.user?.email}</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/credits')}
                    className="w-full py-3 px-4 text-center font-medium text-white bg-[#18181B] rounded-xl hover:bg-[#2F2F3B] transition-all shadow-sm hover:shadow-md active:scale-98 transform duration-200"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Buy More Credits
                    </span>
                  </button>

                  <button
                    onClick={shareWithFriends}
                    className="w-full py-3 px-4 text-center font-medium text-[#18181B] bg-[#18181B]/5 rounded-xl hover:bg-[#18181B]/10 transition-all shadow-sm hover:shadow-md active:scale-98 transform duration-200 relative group"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share with Friends
                    </span>
                    {shareStatus && (
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#18181B] text-white text-xs rounded-full py-1.5 px-3 whitespace-nowrap shadow-lg">
                        {shareStatus}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setShowDobModal(true);
                    }}
                    className="w-full py-3 px-4 text-center font-medium text-[#18181B] bg-[#18181B]/5 rounded-xl hover:bg-[#18181B]/10 transition-all shadow-sm hover:shadow-md active:scale-98 transform duration-200"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Update Birth Date
                    </span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full py-3 px-4 text-center font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all shadow-sm hover:shadow-md active:scale-98 transform duration-200"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>

                <div className="text-center text-gray-400 text-xs mt-8">
                  Version 0.25
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {credits === 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5 mb-6 shadow-sm animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-base font-medium text-yellow-800">Your cosmic energy is depleted</span>
                      <p className="mt-1 text-sm text-yellow-700">
                        Get more credits to continue your astral journey.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => router.push('/credits')}
                      className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-full text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transform hover:scale-105 active:scale-95 duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                      </svg>
                      Replenish Your Credits
                    </button>
                  </div>
                </div>
              )}

              {messages.length === 0 && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#A84A4A]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#A84A4A]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">The stars are aligning...</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Ask your first question to begin your cosmic journey.</p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        isUser
                          ? 'bg-[#18181B] text-white rounded-br-none'
                          : 'bg-white border border-gray-100 text-gray-900 rounded-bl-none'
                      } font-sans transition-all duration-200 hover:shadow-md`}
                      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'" }}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      <div className={`text-xs mt-1 flex items-center ${isUser ? 'text-white/80 justify-end' : 'text-gray-400'}`}>
                        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isUser && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0 ring-2 ring-[#A84A4A]/10">
                    <Image
                      src={`/astro/astro${currentAstrologer}.jpg`}
                      alt={`${astrologers.find(a => a.id === currentAstrologer)?.name}`}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                      quality={100}
                    />
                  </div>
                  <div className="bg-white border border-gray-100 text-gray-900 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#A84A4A]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#A84A4A]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#A84A4A]/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      {/* Bottom Bar - Fixed */}
      <div className={`flex flex-col w-full backdrop-blur-xl bg-white/80 fixed bottom-0 pb-safe border-t border-gray-100 shadow-lg ${showSettings ? 'hidden' : ''}`}>
        <div className="flex items-center justify-center w-full mx-auto max-w-screen-md px-4 py-2">
          <div className="flex items-center w-full max-w-3xl">
            <button
              onClick={clearChat}
              className="flex-shrink-0 flex justify-center items-center rounded-xl p-2.5 text-white bg-[#18181B] hover:bg-[#2F2F3B] transition-colors shadow-sm hover:shadow-md mr-3"
              title="Start a new conversation"
            >
              <svg 
                stroke="currentColor" 
                fill="currentColor" 
                strokeWidth="0" 
                viewBox="0 0 24 24" 
                height="1.5em" 
                width="1.5em" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
              </svg>
            </button>
            <div className="relative flex-1 flex items-center gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Adjust height based on content
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 60)}px`;
                }}
                onFocus={scrollToTextarea}
                onClick={scrollToTextarea}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={credits === 0 ? "You've run out of credits. Get more to continue chatting." : "Ask the stars anything..."}
                disabled={credits === 0}
                className={`rounded-xl border focus:border-[#A84A4A] focus:ring-1 focus:ring-[#A84A4A]/30 focus:outline-none py-3 px-4 w-full resize-none overflow-auto scrollbar-hide text-gray-800 ${
                  credits === 0 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'bg-white shadow-sm'
                }`}
                rows={1}
                maxLength={4096}
                style={{ 
                  height: '44px', 
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim() || credits === 0}
                className={`flex justify-center items-center rounded-xl p-2.5 ${
                  isLoading || !input.trim() || credits === 0
                    ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                    : 'text-white bg-[#18181B] hover:bg-[#2F2F3B] transition-colors shadow-sm hover:shadow-md'
                }`}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add DOB Modal */}
      {showDobModal && session?.user?.email && (
        <DOBInput 
          email={session.user.email} 
          onComplete={handleDobComplete} 
          initialDob={userDob}
        />
      )}

      {/* Add extra styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .active\:scale-95:active {
          transform: scale(0.95);
        }

        .active\:scale-98:active {
          transform: scale(0.98);
        }
        
        .hover\:scale-105:hover {
          transform: scale(1.05);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(168, 74, 74, 0.2);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
