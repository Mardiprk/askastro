interface RateLimitContext {
  email: string;
  limit: number;
  windowMs: number;
}

// Store rate limit data with IP tracking for additional security
const rateLimitStore = new Map<string, { count: number; resetTime: number; ips: Set<string> }>()

// Clean up expired entries periodically (every 15 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 15 * 60 * 1000);
}

export async function rateLimit(context: RateLimitContext, ip?: string) {
  const { email, limit, windowMs } = context
  const now = Date.now()
  
  // Create a key that combines email and IP if available
  const key = email;
  
  const userLimit = rateLimitStore.get(key)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
      ips: new Set(ip ? [ip] : [])
    })
    return true
  }

  // Track IP addresses for potential abuse detection
  if (ip && !userLimit.ips.has(ip)) {
    userLimit.ips.add(ip);
    
    // If too many different IPs are using the same email within the window,
    // this could indicate account sharing or abuse
    if (userLimit.ips.size > 5) {
      console.warn(`Potential abuse detected: ${email} used from ${userLimit.ips.size} different IPs`);
    }
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
} 