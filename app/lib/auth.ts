import { AuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/app/lib/db';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      credits: number;
    } & DefaultSession['user']
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    // Optionally disable encryption if you're having persistent issues
    // encryption: false,
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        console.error('No email provided by Google');
        return false;
      }

      try {
        // Create a cache key for checking if user exists
        const userCacheKey = `user_${user.email}`;
        
        // Check if user exists by email - using cached query to reduce DB reads
        const existingUser = await db.cachedQuery(
          'SELECT * FROM users WHERE email = ? LIMIT 1',
          [user.email],
          userCacheKey,
          30 * 60 * 1000 // Cache for 30 minutes
        ).catch(err => {
          console.error('Database error during sign-in:', err);
          // Return empty result to allow continuing - will create user later
          return { rows: [] };
        });

        // If user doesn't exist, create new user with initial credits
        if (existingUser.rows.length === 0) {
          console.log('Creating new user with initial credits:', user.email);
          try {
            const insertResult = await db.execute({
              sql: 'INSERT INTO users (email, credits) VALUES (?, ?)',
              args: [user.email, 30],
            });

            if (!insertResult) {
              console.error('Failed to create new user');
              // Continue anyway to prevent login failures
            } else {
              // Invalidate user cache after creating a new user
              db.invalidateCache(userCacheKey);
            }
            
            console.log('New user created successfully with 30 credits');
          } catch (dbError) {
            console.error('Error creating user:', dbError);
            // Continue anyway to prevent login failures
          }
        } else {
          console.log('Existing user found:', user.email);
          // Refresh cache for session data
          db.invalidateCache(`session_${user.email}`);
        }

        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        // Still return true to allow sign in even if db operations fail
        return true;
      }
    },
    async session({ session }) {
      if (session?.user?.email) {
        try {
          // Create a cache key for this user's session data
          const sessionCacheKey = `session_${session.user.email}`;
          
          // Get user details including credits - using caching to reduce DB reads
          // This is called on each page load with getServerSession
          const result = await db.cachedQuery(
            'SELECT id, email, credits FROM users WHERE email = ? LIMIT 1',
            [session.user.email],
            sessionCacheKey,
            15 * 60 * 1000 // Cache for 15 minutes
          ).catch(err => {
            console.error('Database error while fetching user data:', err);
            // Return empty result
            return { rows: [] };
          });
          
          if (result.rows.length > 0) {
            const userData = result.rows[0];
            // Add user data to session
            session.user = {
              ...session.user,
              id: Number(userData.id),
              credits: Number(userData.credits),
            };
          } else {
            // Set default values if user not found in database
            session.user = {
              ...session.user,
              id: 0,
              credits: 0,
            };
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set default values
          session.user = {
            ...session.user,
            id: 0,
            credits: 0,
          };
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};