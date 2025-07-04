import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      email: string;
      credits: number;
    } & DefaultSession['user']
  }

  interface User {
    id: number;
    email: string;
    credits: number;
  }
} 