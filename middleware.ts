import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SECURITY_HEADERS, RATE_LIMIT_CONFIG, shouldRateLimit, getRateLimit, containsSuspiciousPatterns } from '@/lib/security'

// Simple in-memory rate limiting (for development)
// In production, use Redis or another distributed store
// Make the ipThrottleMap globally accessible for the security monitoring endpoint
declare global {
  var ipThrottleMap: Map<string, { count: number, timestamp: number }>;
}

if (!global.ipThrottleMap) {
  global.ipThrottleMap = new Map<string, { count: number, timestamp: number }>();
}

// Use environment variables for rate limiting with fallbacks
const MAX_REQUESTS_PER_MINUTE = parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '60', 10);
const BLOCK_DURATION_MS = parseInt(process.env.BLOCK_DURATION_MS || '60000', 10);

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const isRecaptchaEnabled = process.env.ENABLE_RECAPTCHA_PROTECTION === 'true';
  
  // Get client IP - use only x-forwarded-for header
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const url = request.nextUrl;
  
  // Check for suspicious patterns in request
  try {
    if (containsSuspiciousPatterns(request as unknown as Request)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Blocked suspicious request' 
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    // Log error but continue processing if pattern check fails
    console.error('Error checking suspicious patterns:', error);
  }
  
  // Basic DDoS protection through rate limiting
  if (ip !== 'unknown' && shouldRateLimit(url.pathname)) {
    const now = Date.now();
    const ipData = global.ipThrottleMap.get(ip);
    const rateLimit = getRateLimit(url.pathname);
    
    // Check if IP is currently blocked
    if (ipData && ipData.timestamp > now) {
      // IP is still in block period
      return new NextResponse(JSON.stringify({ 
        error: 'Too many requests, please try again later' 
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      });
    }
    
    // Reset count if it's a new time window
    if (!ipData || (now - ipData.timestamp) > 60000) {
      global.ipThrottleMap.set(ip, { count: 1, timestamp: now });
    } else {
      // Increment count in current window
      ipData.count++;
      
      // Block IP if too many requests
      if (ipData.count > rateLimit) {
        global.ipThrottleMap.set(ip, { 
          count: ipData.count, 
          timestamp: now + RATE_LIMIT_CONFIG.blockDurationMs
        });
        
        return new NextResponse(JSON.stringify({ 
          error: 'Too many requests, please try again later' 
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        });
      }
      
      global.ipThrottleMap.set(ip, ipData);
    }
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to run cleanup on each request
      const cleanupTime = now - (60 * 60 * 1000); // Remove entries older than 1 hour
      for (const [storedIp, data] of global.ipThrottleMap.entries()) {
        if (data.timestamp < cleanupTime) {
          global.ipThrottleMap.delete(storedIp);
        }
      }
    }
  }

  // Only check for reCAPTCHA verification if enabled
  if (isRecaptchaEnabled) {
    // Skip verification for the verify page itself
    if (request.nextUrl.pathname === '/verify') {
      return response;
    }

    // Check if user is verified
    const isVerified = request.cookies.get('recaptcha_verified');
    
    // If not verified, redirect to verification page
    if (!isVerified && !request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/verify', request.url));
    }
  }

  // Add security headers
  const headers = response.headers
  
  // Add all security headers from our security configuration
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  return response
}

// Specify which paths should be protected
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 