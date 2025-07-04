import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    // Reload environment variables
    Object.keys(process.env).forEach(key => {
      delete process.env[key];
    });
    
    require('dotenv').config();

    // Revalidate all pages
    revalidatePath('/');

    // Check environment variables
    const envCheck = {
      paypalClientIdExists: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      paypalClientIdLength: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.length || 0,
      paypalClientSecretExists: !!process.env.PAYPAL_CLIENT_SECRET,
      paypalClientSecretLength: process.env.PAYPAL_CLIENT_SECRET?.length || 0,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set'
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables reloaded successfully',
      envCheck
    });
  } catch (error) {
    console.error('Error reloading environment:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 