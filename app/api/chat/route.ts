import { NextResponse } from 'next/server';
import { groq } from '@/app/lib/groq';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { rateLimit } from '@/app/lib/rateLimit';
import { getZodiacSign } from '@/app/lib/zodiac';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Enhanced system prompts for better responses
const SYSTEM_PROMPTS = {
  initialGreeting: `You are a friendly and knowledgeable AI astrologer. Your role is to:
1. Start with a warm, engaging greeting
2. Ask about the user's zodiac sign and interests if their sign is not already provided in the user data
3. Keep responses brief (30-50 words) and conversational
4. Use a mix of astrological wisdom and modern insights
5. Maintain a positive, encouraging tone
6. Never repeat greetings in subsequent messages
7. Make the message feel personal and inviting
8. Use emojis sparingly (max 1-2) to add warmth
9. Focus on creating a welcoming atmosphere`,
  
  regularChat: `You are an expert AI astrologer with deep knowledge of astrology, psychology, and personal development. Your role is to:
1. Provide personalized astrological insights based on the user's zodiac sign
2. Keep the main response concise (100 words maximum)
3. Always end with a relevant follow-up question to encourage further engagement
4. Format your response in two parts:
   - First part: Your main astrological insight/answer (max 100 words)
   - Second part: A follow-up question to engage the user
5. Use a professional yet friendly tone
6. Include specific planetary positions and their meanings when relevant
7. Avoid making absolute predictions, instead focusing on guidance and possibilities
8. Never use greetings or salutations - start responses directly with the content
9. Maintain conversation flow without repeating previous messages`
};

// Function to get user DOB and zodiac sign
async function getUserZodiacInfo(email: string) {
  try {
    // Use cached query to reduce database reads
    const cacheKey = `dob_check_${email}`;
    const result = await db.cachedQuery(
      `SELECT dob, dob_collected FROM users WHERE email = ? LIMIT 1`,
      [email],
      cacheKey,
      60 * 60 * 1000 // Cache for 1 hour
    );

    if (!result.rows || result.rows.length === 0) {
      return { dob_collected: false, zodiacSign: null, dob: null };
    }

    const user = result.rows[0];
    const dob_collected = !!user.dob_collected;
    let zodiacSign = null;
    
    if (dob_collected && user.dob) {
      zodiacSign = getZodiacSign(user.dob);
    }

    return { 
      dob_collected, 
      zodiacSign,
      dob: user.dob
    };
  } catch (error) {
    console.error('Error fetching user zodiac info:', error);
    return { dob_collected: false, zodiacSign: null, dob: null };
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          userMessage: 'Please sign in to continue chatting.',
          success: false 
        }, 
        { status: 401 }
      );
    }

    // Get client IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    // Rate limit: 20 requests per minute
    const isAllowed = await rateLimit({
      email: session.user.email,
      limit: 20,
      windowMs: 60 * 1000
    }, clientIp);

    if (!isAllowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          userMessage: 'The cosmic channels are busy. Please wait a moment before trying again.',
          success: false 
        }, 
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { messages, initialGreeting = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid request format', 
          userMessage: 'Please provide a valid message.',
          success: false 
        }, 
        { status: 400 }
      );
    }

    // Skip credit check for initial greeting
    if (!initialGreeting) {
      try {
        const result = await db.execute({
          sql: 'SELECT credits FROM users WHERE email = ?',
          args: [session.user.email],
        });

        if (result.rows.length === 0) {
          return NextResponse.json(
            { 
              error: 'User not found', 
              userMessage: 'Your account could not be found. Please try signing in again.',
              success: false 
            }, 
            { status: 404 }
          );
        }

        const currentCredits = Number(result.rows[0].credits);
        if (currentCredits < 5) {
          return NextResponse.json(
            { 
              error: 'Insufficient credits', 
              userMessage: 'You need more credits to continue chatting. Would you like to purchase more?',
              success: false 
            }, 
            { status: 402 }
          );
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { 
            error: 'Failed to check credits', 
            userMessage: 'There was an issue checking your credits. Please try again.',
            success: false 
          }, 
          { status: 500 }
        );
      }
    }

    try {
      // Get user's zodiac information
      const { zodiacSign, dob, dob_collected } = await getUserZodiacInfo(session.user.email);
      
      // Get the appropriate system prompt
      let systemPrompt = initialGreeting ? SYSTEM_PROMPTS.initialGreeting : SYSTEM_PROMPTS.regularChat;
      
      // Add zodiac information to the system prompt if available
      if (zodiacSign && dob_collected) {
        systemPrompt = `${systemPrompt}\n\nIMPORTANT USER DATA: The user's zodiac sign is ${zodiacSign} (based on their DOB: ${dob}). Use this information to personalize your responses without asking for their sign again.`;
      }

      // Prepare messages with system prompt
      const preparedMessages = [
        { role: "system", content: systemPrompt },
        ...messages
      ];

      console.log('Calling Groq API with messages:', preparedMessages);

      // Call Groq API with enhanced parameters
      const completion = await groq.chat.completions.create({
        messages: preparedMessages,
        model: "gemma2-9b-it",
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null
      });

      // Validate response
      if (!completion?.choices?.[0]?.message?.content) {
        console.error('Invalid response from Groq API:', completion);
        throw new Error('Invalid response from Groq API');
      }

      const response = completion.choices[0].message.content;

      // Log the response for debugging
      console.log('Groq API Response:', {
        response,
        initialGreeting,
        hasZodiacInfo: !!zodiacSign
      });

      // Update credits if not initial greeting
      if (!initialGreeting) {
        await db.execute({
          sql: 'UPDATE users SET credits = credits - 5 WHERE email = ?',
          args: [session.user.email],
        });
      }

      return NextResponse.json({
        response,
        success: true
      });
    } catch (error: any) {
      console.error('Groq API Error:', {
        message: error.message,
        status: error.status,
        type: error.type,
        code: error.code,
        stack: error.stack
      });
      
      // Don't deduct credits on API failure
      const errorMessage = error.message || 'Failed to generate response';
      const statusCode = error.status || 500;
      
      // Provide user-friendly error messages based on error type
      let userFacingError = 'I apologize, but I\'m having trouble connecting to my cosmic energies. Please try again in a moment.';
      
      if (statusCode === 429) {
        userFacingError = 'The cosmic channels are currently busy. Please try again in a few moments.';
      } else if (statusCode === 401 || statusCode === 403) {
        userFacingError = 'There seems to be an authentication issue with the cosmic energies. Please contact support.';
      } else if (statusCode === 503) {
        userFacingError = 'The cosmic energies are temporarily unavailable. Please try again in a few minutes.';
      } else if (statusCode >= 500) {
        userFacingError = 'I apologize, but I\'m having trouble processing your request right now. Your credits have not been deducted. Please try again.';
      } else if (errorMessage.includes('API configuration error')) {
        userFacingError = 'There is a configuration issue with the cosmic energies. Please contact support.';
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
          userMessage: userFacingError,
          success: false
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        userMessage: 'I\'m sorry, but something unexpected happened. Your credits have not been deducted. Please try again.',
        success: false
      },
      { status: 500 }
    );
  }
}