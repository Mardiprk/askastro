import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

// Reference to the rate limiting map in middleware
// Note: This won't work as expected in a serverless environment
// For production, use Redis or another distributed store
declare global {
  var ipThrottleMap: Map<string, { count: number, timestamp: number }>;
}

const prisma = new PrismaClient();

// List of admin emails
const ADMIN_EMAILS = [process.env.ADMIN_EMAIL || ''];

export async function GET(request: NextRequest) {
  // Check admin authorization
  const session = await getServerSession();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { id: true, email: true }
  });
  
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Get blocked IPs from the throttle map
  const blockedIps: Record<string, number> = {};
  const now = Date.now();
  
  if (global.ipThrottleMap) {
    for (const [ip, data] of global.ipThrottleMap.entries()) {
      if (data.timestamp > now) {
        // Calculate remaining block time in seconds
        blockedIps[ip] = Math.ceil((data.timestamp - now) / 1000);
      }
    }
  }
  
  // Return security stats
  return NextResponse.json({
    blockedIps,
    totalBlocked: Object.keys(blockedIps).length,
    timestamp: new Date().toISOString()
  });
} 