#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config();

// List of required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'GROQ_API_KEY'
];

// Check environment variables
console.log('Environment Variables Check:');
console.log('---------------------------');

// Check for each variable
requiredEnvVars.forEach(varName => {
  const exists = !!process.env[varName];
  const length = exists ? process.env[varName].length : 0;
  console.log(`${varName}: ${exists ? `exists (length: ${length})` : 'missing'}`);
});

console.log('\nEnvironment:', process.env.NODE_ENV || 'development');

// Check for missing environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.log('\nMissing required environment variables:');
  missingVars.forEach(varName => console.log(`- ${varName}`));
  process.exit(1);
} else {
  console.log('\nAll required environment variables are present.');
}

// Check if we're in development or production
console.log('\nEnvironment:', process.env.NODE_ENV || 'development');

// Validate URLs
if (process.env.NODE_ENV === 'production') {
  if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
    console.warn('\nWarning: NEXT_PUBLIC_APP_URL contains localhost in production');
  }
}

// Additional validation for PayPal variables
if (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && 
    !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID.startsWith('AazOQL')) {
  console.warn('\nWarning: NEXT_PUBLIC_PAYPAL_CLIENT_ID doesn\'t match expected pattern');
}

// Check for duplicate keys in different environments
if (process.env.NODE_ENV === 'production' && 
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID === 'AazOQLBxghVqxEC3WAZdYXUj-o4WbSl58Y7oJXplpP2SVu0-0bMD9Sa69w7szBHgtr9eJ4Vf6VCMbxng') {
  console.warn('\nWarning: You are using the test PayPal client ID in production');
} 