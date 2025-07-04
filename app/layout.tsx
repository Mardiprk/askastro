import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from "react-hot-toast";
import SessionProvider from "./components/SessionProvider"

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://askastro.vercel.app'),
  title: {
    default: "AskAstro - Your AI Astrological Guide",
    template: "%s | AskAstro"
  },
  description: "Discover your cosmic destiny with AI-powered astrological insights. Get personalized readings, birth chart analysis, and daily horoscopes powered by advanced AI technology.",
  keywords: [
    "astrology",
    "AI astrology",
    "birth chart",
    "horoscope",
    "astrological readings",
    "personalized astrology",
    "daily horoscope",
    "astrological guidance",
    "zodiac signs",
    "astrological predictions"
  ],
  authors: [{ name: "AskAstro Team" }],
  creator: "AskAstro",
  publisher: "AskAstro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://askastro.vercel.app",
    siteName: "AskAstro",
    title: "AskAstro - Your AI Astrological Guide",
    description: "Discover your cosmic destiny with AI-powered astrological insights. Get personalized readings, birth chart analysis, and daily horoscopes.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1483,
        height: 716,
        alt: "AskAstro - AI-Powered Astrological Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AskAstro - Your AI Astrological Guide",
    description: "Discover your cosmic destiny with AI-powered astrological insights. Get personalized readings, birth chart analysis, and daily horoscopes.",
    images: ["/og-image.jpg"],
    creator: "@askastro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
  },
  alternates: {
    canonical: "https://askastro.vercel.app",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
    if (!session) {
      console.log("No active session found");
    }
  } catch (error) {
    console.error("Session retrieval error:", error);
    // Log specific error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }

  return (
    <html lang="en" className={`${ebGaramond.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/Icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-inter">
        <ErrorBoundary>
          <SessionProvider session={session}>
            <Toaster />
            {children}
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}