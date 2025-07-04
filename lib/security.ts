/**
 * Website Security Configuration
 * 
 * This module centralizes security settings and provides
 * helper functions for DDoS protection and security monitoring.
 */

// Common HTTP headers for security enhancement
export const SECURITY_HEADERS = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable strict CSP
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://www.paypal.com https://www.paypalobjects.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://www.paypalobjects.com; img-src 'self' data: blob: https://*.paypal.com; font-src 'self' https://www.paypalobjects.com; connect-src 'self' https://*.paypal.com https://www.google.com/recaptcha/; frame-src 'self' https://www.paypal.com https://www.google.com/recaptcha/; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests;",
  
  // Enable HSTS
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  
  // Prevent browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self "https://*.paypal.com")',
  
  // Add Referrer-Policy header
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting settings for DDoS protection
export const RATE_LIMIT_CONFIG = {
  // Maximum requests per minute per IP
  maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '60', 10),
  
  // Duration to block IPs in milliseconds
  blockDurationMs: parseInt(process.env.BLOCK_DURATION_MS || '60000', 10),
  
  // Skip rate limiting for these paths
  excludePaths: [
    '/api/health', 
    '/_next/static/', 
    '/favicon.ico',
    '/public/'
  ],
  
  // Additional protection for sensitive endpoints
  sensitiveEndpoints: {
    '/api/auth': 30, // 30 requests per minute
    '/api/user': 40,
    '/api/transactions': 20
  }
};

// Function to check if a path should be rate limited
export function shouldRateLimit(path: string): boolean {
  // Skip rate limiting for excluded paths
  for (const excludePath of RATE_LIMIT_CONFIG.excludePaths) {
    if (path.startsWith(excludePath)) {
      return false;
    }
  }
  return true;
}

// Function to get rate limit for a specific path (lower limit for sensitive endpoints)
export function getRateLimit(path: string): number {
  for (const [endpoint, limit] of Object.entries(RATE_LIMIT_CONFIG.sensitiveEndpoints)) {
    if (path.startsWith(endpoint)) {
      return limit;
    }
  }
  return RATE_LIMIT_CONFIG.maxRequestsPerMinute;
}

// Helper function to check common malicious patterns in requests
export function containsSuspiciousPatterns(req: Request): boolean {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Check for SQL injection attempts
  const sqlPatterns = [
    "SELECT", "UNION", "INSERT", "DROP", "DELETE FROM", 
    "UPDATE", "1=1", "OR 1=1", "--", "/*", "*/"
  ];
  
  // Check for common path traversal patterns
  const pathTraversalPatterns = [
    "../", "..\\", "/etc/passwd", "c:\\windows", "cmd.exe",
    "config.php", "wp-config", ".env", "backup", ".git"
  ];
  
  // Check for common XSS patterns
  const xssPatterns = [
    "<script>", "javascript:", "onerror=", "onload=", "eval(",
    "document.cookie", "alert(", "prompt(", "confirm("
  ];
  
  // Combine all patterns to check
  const suspiciousPatterns = [
    ...sqlPatterns, 
    ...pathTraversalPatterns, 
    ...xssPatterns
  ];
  
  // Check if URL contains any suspicious patterns
  const urlLower = decodeURIComponent(path.toLowerCase());
  for (const pattern of suspiciousPatterns) {
    if (urlLower.includes(pattern.toLowerCase())) {
      return true;
    }
  }
  
  // Check query parameters for suspicious patterns
  for (const [_, value] of url.searchParams.entries()) {
    const valueLower = decodeURIComponent(value.toLowerCase());
    for (const pattern of suspiciousPatterns) {
      if (valueLower.includes(pattern.toLowerCase())) {
        return true;
      }
    }
  }
  
  return false;
} 