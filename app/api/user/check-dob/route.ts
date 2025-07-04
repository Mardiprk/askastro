import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get email from query parameters
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    // Validate request
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify that the email matches the authenticated user
    if (email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query the database to check if DOB has been collected using caching
    // Create a unique cache key for this user's DOB data
    const cacheKey = `dob_check_${email}`;
    const result = await db.cachedQuery(
      `SELECT dob, dob_collected FROM users WHERE email = ? LIMIT 1`,
      [email],
      cacheKey,
      60 * 60 * 1000 // Cache for 1 hour since DOB rarely changes
    );

    // If user not found
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];
    
    return NextResponse.json({
      dob: user.dob,
      dob_collected: !!user.dob_collected
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking DOB status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 