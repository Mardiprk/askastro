#!/usr/bin/env node
require('dotenv').config();

console.log('Groq API Configuration Check:');
console.log('----------------------------');

if (process.env.GROQ_API_KEY) {
  console.log(`GROQ_API_KEY: exists (length: ${process.env.GROQ_API_KEY.length})`);
  console.log('Status: Ready to use Groq API');
} else {
  console.log('GROQ_API_KEY: missing');
  console.log('Status: GROQ_API_KEY is not configured. Please add it to your .env file.');
  process.exit(1);
} 