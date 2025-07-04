import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    let credits: number;
    try {
      const body = await req.json();
      if (typeof body.credits !== 'number' || isNaN(body.credits) || body.credits < 0) {
        return NextResponse.json({ error: 'Invalid credits value' }, { status: 400 });
      }
      credits = Math.floor(body.credits); // Ensure integer value
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Update user credits
    try {
      // Use a transaction for atomicity and to reduce queries
      await db.execute({
        sql: 'UPDATE users SET credits = ? WHERE email = ?',
        args: [credits, session.user.email],
      });

      // Invalidate any cached queries related to this user
      db.invalidateCache(`user_${session.user.email}`);
      db.invalidateCache(`session_${session.user.email}`);

      return NextResponse.json({ success: true, credits });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to update credits' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Update credits API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 