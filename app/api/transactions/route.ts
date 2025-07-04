import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a unique cache key for this user's transactions
    const cacheKey = `transactions_${session.user.email}`;
    
    // Get user transactions with caching (cache for 5 minutes)
    // Transactions don't change as frequently as other data, so this reduces database load
    const result = await db.cachedQuery(
      'SELECT * FROM transactions WHERE user_email = ? ORDER BY created_at DESC',
      [session.user.email],
      cacheKey,
      5 * 60 * 1000 // Cache for 5 minutes
    );

    return NextResponse.json({ transactions: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}