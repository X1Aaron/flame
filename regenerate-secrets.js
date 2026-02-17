#!/usr/bin/env node
/**
 * Regenerate Secrets Script
 *
 * This script generates new cryptographically secure secrets for Flame.
 * Run this script before deploying to production.
 *
 * Usage: node regenerate-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('=== Flame Security: Regenerating Secrets ===\n');

// Generate a new JWT secret (64 bytes = 512 bits)
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Generate a random password (for demonstration - user should change this)
const randomPassword = crypto.randomBytes(16).toString('base64').replace(/[/+=]/g, '').substring(0, 16);

console.log('✅ Generated new JWT secret');
console.log('✅ Generated random password\n');

// Read current .env file if it exists
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📝 Found existing .env file\n');
} else {
  // Create a new .env file from defaults
  envContent = `PORT=5005
NODE_ENV=development
VERSION=2.3.2
PASSWORD=flame_password
SECRET=e02eb43d69953658c6d07311d6313f2d4467672cb881f96b29368ba1f3f4da4b
`;
  console.log('📝 No .env file found, creating new one\n');
}

// Update the SECRET in .env
const oldSecretMatch = envContent.match(/SECRET=.*/);
if (oldSecretMatch) {
  envContent = envContent.replace(/SECRET=.*/, `SECRET=${jwtSecret}`);
  console.log('✅ Updated SECRET in .env file');
} else {
  envContent += `\nSECRET=${jwtSecret}`;
  console.log('✅ Added SECRET to .env file');
}

// Update the PASSWORD with a note
const oldPasswordMatch = envContent.match(/PASSWORD=.*/);
if (oldPasswordMatch) {
  envContent = envContent.replace(/PASSWORD=.*/, `PASSWORD=${randomPassword}`);
  console.log('✅ Updated PASSWORD in .env file');
} else {
  envContent += `\nPASSWORD=${randomPassword}`;
  console.log('✅ Added PASSWORD to .env file');
}

// Write the updated .env file
fs.writeFileSync(envPath, envContent);

console.log('\n=== Success! ===\n');
console.log('Your new secrets have been generated and saved to .env\n');
console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. The PASSWORD has been set to a random value');
console.log('2. You should change this password after first login');
console.log('3. NEVER commit the .env file to version control');
console.log('4. Create a .env.example template without secrets for documentation\n');

console.log('📋 New credentials:');
console.log(`   PASSWORD: ${randomPassword}`);
console.log(`   (JWT SECRET is stored in .env but not displayed for security)\n`);

console.log('🔐 Next steps:');
console.log('1. Add .env to .gitignore (if not already present)');
console.log('2. Start the application and log in with the new password');
console.log('3. Change your password immediately after first login');
console.log('4. Keep this password in a secure password manager\n');
