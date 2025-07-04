import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@libsql/client';
import { rateLimit } from '@/app/lib/rateLimit';
import { db } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    // Rate limit: 5 requests per minute
    const isAllowed = await rateLimit({
      email: session.user.email || '',
      limit: 5,
      windowMs: 60 * 1000
    }, clientIp);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Please wait before updating your information again.' },
        { status: 429 }
      );
    }

    // Get request body
    const body = await request.json();
    const { email, dob } = body;

    // Validate request
    if (!email || !dob) {
      return NextResponse.json({ error: 'Email and DOB are required' }, { status: 400 });
    }

    // Verify that the email matches the authenticated user
    if (email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate DOB format and range
    const dobDate = new Date(dob);
    const today = new Date();
    
    if (isNaN(dobDate.getTime()) || dobDate > today) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 });
    }
    
    // Calculate age and check if it's reasonable (13-100 years)
    const age = Math.floor((today.getTime() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13 || age > 100) {
      return NextResponse.json({ 
        error: 'Invalid age', 
        message: 'You must be between 13 and 100 years old.' 
      }, { status: 400 });
    }

    // First check if the DOB is already the same to avoid unnecessary updates
    const existingUserResult = await db.cachedQuery(
      `SELECT dob FROM users WHERE email = ? LIMIT 1`,
      [email],
      `user_dob_check_${email}`,
      60 * 1000 // 1 minute cache
    );

    if (existingUserResult.rows && existingUserResult.rows.length > 0) {
      const existingDob = existingUserResult.rows[0].dob;
      if (existingDob === dob) {
        // DOB is already the same, no need to update
        return NextResponse.json({ 
          success: true, 
          message: 'No changes needed',
          dob: dob
        }, { status: 200 });
      }
    }

    // Update the user's DOB in the database
    await db.execute({
      sql: `UPDATE users SET dob = ?, dob_collected = 1 WHERE email = ?`,
      args: [dob, email]
    });

    // Invalidate the cache for this user's DOB data
    db.invalidateCache(`dob_check_${email}`);
    db.invalidateCache(`user_dob_check_${email}`);
    db.invalidateCache(`session_${email}`);

    return NextResponse.json({ 
      success: true,
      message: 'Date of birth updated successfully',
      dob: dob
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating DOB:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 