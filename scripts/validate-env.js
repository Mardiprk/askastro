#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are set
 * and meet minimum security requirements.
 */

require('dotenv').config();

const requiredEnvVars = [
  // Auth related
  { name: 'GOOGLE_CLIENT_ID', minLength: 30 },
  { name: 'GOOGLE_CLIENT_SECRET', minLength: 20 },
  { name: 'NEXTAUTH_URL', minLength: 10 },
  { name: 'NEXTAUTH_SECRET', minLength: 20 },
  
  // Database related
  { name: 'TURSO_DATABASE_URL', minLength: 10 },
  { name: 'TURSO_AUTH_TOKEN', minLength: 20 },
  
  // API keys
  { name: 'GROQ_API_KEY', minLength: 10 },
  
  // App URLs
  { name: 'NEXT_PUBLIC_APP_URL', minLength: 10 },
  
  // Payment related
  { name: 'NEXT_PUBLIC_PAYPAL_CLIENT_ID', minLength: 20 },
  { name: 'PAYPAL_CLIENT_SECRET', minLength: 20 },
];

function validateEnvVars() {
  const missingVars = [];
  const invalidVars = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];
    
    if (!value) {
      missingVars.push(envVar.name);
      continue;
    }

    if (value.length < envVar.minLength) {
      invalidVars.push({
        name: envVar.name,
        error: `must be at least ${envVar.minLength} characters long`
      });
    }
  }

  if (missingVars.length > 0 || invalidVars.length > 0) {
    console.error('\nEnvironment validation failed:');
    
    if (missingVars.length > 0) {
      console.error('\nMissing required environment variables:');
      missingVars.forEach(varName => console.error(`- ${varName}`));
    }

    if (invalidVars.length > 0) {
      console.error('\nInvalid environment variables:');
      invalidVars.forEach(({ name, error }) => console.error(`- ${name}: ${error}`));
    }

    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

validateEnvVars(); 