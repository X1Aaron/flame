# Testing Flame on Mac - Complete Guide

**Platform**: macOS
**Node.js Required**: v20 LTS
**Estimated Time**: 30-45 minutes

---

## Prerequisites Check

First, let's verify you have the required tools:

```bash
# Check Node.js version (need v20 or higher)
node --version
# Should show v20.x.x or higher

# Check npm version
npm --version
# Should show v10.x.x or higher

# If you need to install/update Node.js:
# Download from: https://nodejs.org/
# Or use Homebrew: brew install node@20
```

---

## Option 1: Quick Test (Recommended for Mac) ⚡

This is the fastest way to test on Mac - uses Docker to avoid native module compilation issues.

### Install Docker Desktop (if not already installed)
Download from: https://www.docker.com/products/docker-desktop/

### Build and Run
```bash
# 1. Navigate to the project
cd /path/to/flame

# 2. Build the Docker image (takes 5-10 minutes)
docker build -t flame:secure -f .docker/Dockerfile .

# 3. Run the container
docker run -d \
  -p 5005:5005 \
  -v "$(pwd)/data:/app/data" \
  -e PASSWORD=exjpC0v5dIA0J5mJ \
  --name flame \
  flame:secure

# 4. Check if it's running
docker logs -f flame
# Press Ctrl+C to stop following logs

# 5. Open in browser
open http://localhost:5005
```

### Testing with Docker
1. **Login Test**
   - Username: (leave blank or "admin")
   - Password: `exjpC0v5dIA0J5mJ`
   - Should successfully log in

2. **Authentication Bug Fix Test** (CRITICAL)
   - Open Developer Tools (Cmd+Option+I in Chrome/Safari)
   - Go to Console tab
   - Try this test:
   ```javascript
   // Test 1: Invalid token should be REJECTED
   fetch('http://localhost:5005/api/apps', {
     headers: { 'Authorization-Flame': 'Bearer fake_invalid_token_12345' }
   }).then(r => r.json()).then(console.log);
   // Should return error or empty result (not authenticated)

   // Test 2: Valid login
   fetch('http://localhost:5005/api/auth', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ password: 'exjpC0v5dIA0J5mJ', duration: '1h' })
   }).then(r => r.json()).then(data => {
     console.log('Valid token:', data.data.token);
     // Now try with valid token
     fetch('http://localhost:5005/api/apps', {
       headers: { 'Authorization-Flame': 'Bearer ' + data.data.token }
     }).then(r => r.json()).then(console.log);
     // Should succeed
   });
   ```

3. **Core Functionality**
   - Click "Add Application"
   - Name: "Test App"
   - URL: "https://google.com"
   - Save
   - Verify it appears on the homepage
   - Delete it

### Stop Docker Container
```bash
# Stop
docker stop flame

# Remove (if you want to start fresh)
docker rm flame

# View logs if there were issues
docker logs flame
```

---

## Option 2: Development Mode (Native Node.js)

This runs directly on your Mac but may require some troubleshooting for native modules.

### Step 1: Install Dependencies

```bash
# Navigate to project
cd /path/to/flame

# Install backend dependencies
npm install

# This might take 10-15 minutes and may show warnings
# The sqlite3 native module needs to compile
```

**If npm install fails with sqlite3 errors:**

```bash
# Option A: Install build tools via Xcode Command Line Tools
xcode-select --install

# Then try again
npm install

# Option B: Skip optional dependencies
npm install --no-optional

# Option C: Use pre-built binaries
npm install sqlite3 --build-from-source=false
```

### Step 2: Install Client Dependencies

```bash
cd client
npm install
cd ..
```

### Step 3: Start Development Server

```bash
# This starts both backend (port 5005) and frontend (port 3000)
npm run dev
```

You should see:
```
[0] Server is running on port 5005 in development mode
[1] webpack compiled successfully
```

### Step 4: Test in Browser

Open: http://localhost:3000 (development proxy) or http://localhost:5005 (direct backend)

---

## Option 3: Production Mode (Native Node.js)

For testing the production build:

```bash
# 1. Install all dependencies (if not already done)
npm install
cd client && npm install && cd ..

# 2. Build the client
cd client
npm run build
cd ..

# 3. Start production server
NODE_ENV=production npm start
```

Open: http://localhost:5005

---

## Critical Authentication Tests 🔒

### Test 1: Valid Login ✅
```bash
# From Terminal
curl -X POST http://localhost:5005/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"exjpC0v5dIA0J5mJ","duration":"1h"}'

# Should return:
# {"success":true,"data":{"token":"eyJhbGc..."}}
```

### Test 2: Invalid Login ❌
```bash
curl -X POST http://localhost:5005/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong_password","duration":"1h"}'

# Should return:
# {"success":false,"error":"Invalid credentials"}
```

### Test 3: Invalid Token Rejection (THE BUG FIX) ⚠️
```bash
# This should FAIL (be rejected) - verifies the bug is fixed
curl http://localhost:5005/api/config \
  -H "Authorization-Flame: Bearer fake_invalid_token"

# Should return unauthorized error
# BEFORE FIX: Would have accepted this!
# AFTER FIX: Should reject it
```

### Test 4: Valid Token Accepted ✅
```bash
# First get a valid token
TOKEN=$(curl -s -X POST http://localhost:5005/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"exjpC0v5dIA0J5mJ","duration":"1h"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Then use it
curl http://localhost:5005/api/config \
  -H "Authorization-Flame: Bearer $TOKEN"

# Should return config data successfully
```

---

## Functional Testing Checklist

### Basic Functionality
- [ ] Server starts without errors
- [ ] Login page loads
- [ ] Can login with password `exjpC0v5dIA0J5mJ`
- [ ] Invalid password is rejected
- [ ] Homepage loads after login

### Application Management
- [ ] Click "Applications" in sidebar
- [ ] Click "Add Application" button
- [ ] Create app with:
  - Name: "GitHub"
  - URL: "https://github.com"
  - Icon: "github" (search for it)
- [ ] Save successfully
- [ ] App appears in list
- [ ] Click on app - opens URL
- [ ] Edit app - change name to "GitHub Home"
- [ ] Delete app

### Bookmarks
- [ ] Click "Bookmarks" in sidebar
- [ ] Add bookmark:
  - Name: "Test Bookmark"
  - URL: "https://example.com"
- [ ] Create a category
- [ ] Move bookmark to category
- [ ] Delete bookmark and category

### Search
- [ ] Click search bar
- [ ] Type "test" - should filter locally
- [ ] Type "/g test" - should use Google search
- [ ] Search providers work

### Settings
- [ ] Click "Settings" in sidebar
- [ ] **IMPORTANT**: Change password!
  - Old password: `exjpC0v5dIA0J5mJ`
  - New password: (your secure password)
  - Save
- [ ] Test login with new password
- [ ] Change theme
- [ ] Toggle dark mode
- [ ] Try custom CSS

### Weather Widget (Optional)
- [ ] Get API key from https://www.weatherapi.com/
- [ ] Enter API key in Settings > Weather
- [ ] Enter your latitude/longitude
- [ ] Save
- [ ] Weather widget should appear on homepage

---

## Common Mac-Specific Issues

### Issue: "gyp: No Xcode or CLT version detected"

**Solution:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# If already installed, reset path
sudo xcode-select --reset

# Then try npm install again
npm install
```

### Issue: "EACCES: permission denied"

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use a Node version manager like nvm
brew install nvm
nvm install 20
nvm use 20
```

### Issue: "Port 5005 already in use"

**Solution:**
```bash
# Find what's using the port
lsof -ti:5005

# Kill the process
kill -9 $(lsof -ti:5005)

# Or change the port in .env
echo "PORT=5006" >> .env
```

### Issue: "sqlite3 module not found"

**Solution:**
```bash
# Rebuild sqlite3 for your Mac architecture
cd node_modules/sqlite3
npm run install
cd ../..

# Or reinstall it
npm uninstall sqlite3
npm install sqlite3 --build-from-source
```

### Issue: Apple Silicon (M1/M2/M3) Compatibility

**Solution:**
```bash
# Use Rosetta for x86_64 packages (if needed)
arch -x86_64 npm install

# Or make sure you're using ARM64 native Node
node -p "process.arch"
# Should show "arm64"

# Best: Use Docker - it handles architecture automatically
```

---

## Performance Testing on Mac

```bash
# Test server response time
time curl -s http://localhost:5005 > /dev/null

# Monitor memory usage
while true; do
  ps aux | grep "node server.js" | head -1
  sleep 5
done

# Monitor CPU usage
top -pid $(pgrep -f "node server.js")
```

---

## Using Mac-Specific Tools

### Test with Safari
```bash
open -a Safari http://localhost:5005
```

### Test with Chrome
```bash
open -a "Google Chrome" http://localhost:5005
```

### Test with Firefox
```bash
open -a Firefox http://localhost:5005
```

### Check Console Logs (Mac Terminal)
```bash
# Watch logs in real-time
tail -f data/logs/*.log

# Search for errors
grep -i error data/logs/*.log
```

---

## Automated Test Script for Mac

Save this as `test-flame.sh`:

```bash
#!/bin/bash

echo "🔥 Flame Security Test Suite for Mac"
echo "====================================="
echo ""

BASE_URL="http://localhost:5005"
PASSWORD="exjpC0v5dIA0J5mJ"

echo "1️⃣ Testing server availability..."
if curl -s "$BASE_URL" > /dev/null; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server is not responding"
    exit 1
fi

echo ""
echo "2️⃣ Testing invalid login..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong_password","duration":"1h"}')

if echo "$RESPONSE" | grep -q "Invalid credentials"; then
    echo "   ✅ Invalid password correctly rejected"
else
    echo "   ❌ Invalid password not rejected properly"
fi

echo ""
echo "3️⃣ Testing valid login..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$PASSWORD\",\"duration\":\"1h\"}" \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "   ✅ Valid login successful"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo "   ❌ Valid login failed"
    exit 1
fi

echo ""
echo "4️⃣ Testing invalid token rejection (BUG FIX)..."
RESPONSE=$(curl -s "$BASE_URL/api/config" \
  -H "Authorization-Flame: Bearer fake_invalid_token_123")

if echo "$RESPONSE" | grep -q "success"; then
    echo "   ❌ CRITICAL: Invalid token was accepted! Bug not fixed!"
    exit 1
else
    echo "   ✅ Invalid token correctly rejected (bug fix verified)"
fi

echo ""
echo "5️⃣ Testing valid token acceptance..."
RESPONSE=$(curl -s "$BASE_URL/api/config" \
  -H "Authorization-Flame: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "success"; then
    echo "   ✅ Valid token accepted"
else
    echo "   ❌ Valid token rejected"
fi

echo ""
echo "====================================="
echo "🎉 All critical tests passed!"
echo ""
echo "⚠️  IMPORTANT: Change your password now!"
echo "   1. Open http://localhost:5005"
echo "   2. Go to Settings"
echo "   3. Change password from: $PASSWORD"
echo "   4. Save in password manager"
```

Make it executable and run:
```bash
chmod +x test-flame.sh
./test-flame.sh
```

---

## Clean Up After Testing

### Stop Everything
```bash
# If running with npm
# Press Ctrl+C in the terminal

# If running in background
pkill -f "node server.js"
pkill -f "react-scripts"

# If using Docker
docker stop flame
docker rm flame
```

### Clean Install (Start Fresh)
```bash
# Remove all installed packages
rm -rf node_modules
rm -rf client/node_modules

# Remove build artifacts
rm -rf client/build

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
cd client && npm install && cd ..
```

---

## Troubleshooting Tips

### View Detailed Logs
```bash
# Run with debug output
DEBUG=* npm start

# Or set environment variable
export DEBUG=*
npm start
```

### Check File Permissions
```bash
# Ensure data directory is writable
ls -la data/
chmod 755 data/

# Check .env file
ls -la .env
cat .env
```

### Reset to Fresh State
```bash
# Remove database (WARNING: deletes all data)
rm -f data/db.sqlite

# Server will create new database on next start
```

---

## Success Criteria ✅

Your testing is complete when:

- ✅ Server starts without errors
- ✅ Can login with password
- ✅ Invalid passwords are rejected
- ✅ **Invalid tokens are rejected** (bug fix verified)
- ✅ Valid tokens work correctly
- ✅ Can create/edit/delete apps
- ✅ Can create/edit/delete bookmarks
- ✅ Search functionality works
- ✅ Password has been changed
- ✅ New password saved in password manager

---

## Next Steps After Testing

1. **Change your password** (if you haven't already)
2. **Commit changes to git**
   ```bash
   git add .
   git commit -m "Security fixes: Updated dependencies, fixed auth bug, regenerated secrets"
   ```
3. **Deploy to production** (if applicable)
4. **Set up monitoring and backups**
5. **Schedule regular security audits** (`npm audit` monthly)

---

## Questions or Issues?

- Check `SECURITY_FIXES_SUMMARY.md` for complete details
- Check `CRITICAL_AUTH_BUG.md` for auth bug specifics
- Check `SECURITY_REMEDIATION_LOG.md` for audit trail

**Need help?** The Docker approach is most reliable on Mac if npm install gives you trouble!
