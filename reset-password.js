// Quick password reset script
const fs = require('fs');
const path = require('path');

// Get new password from command line
const newPassword = process.argv[2];

if (!newPassword) {
  console.log('Usage: node reset-password.js <new-password>');
  console.log('Example: node reset-password.js myNewPassword123');
  process.exit(1);
}

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace password
envContent = envContent.replace(/PASSWORD=.*/g, `PASSWORD=${newPassword}`);

// Write back
fs.writeFileSync(envPath, envContent);

console.log('✅ Password updated in .env file!');
console.log(`New password: ${newPassword}`);
console.log('\nNext steps:');
console.log('1. Rebuild Docker: docker build -t flame:modern-frontend -f .docker/Dockerfile .');
console.log('2. Stop container: docker stop flame && docker rm flame');
console.log('3. Start container: docker run -d -p 5005:5005 -v "$(pwd)/data:/app/data" --name flame flame:modern-frontend');
console.log('4. Login with your new password!');
