# Quick Start Guide - After Security Fixes

**⚠️ READ THIS FIRST BEFORE RUNNING THE APPLICATION**

---

## What Was Fixed

✅ **46 security vulnerabilities** resolved (including 5 critical)
✅ **1 critical authentication bug** fixed (was accepting ANY token as valid)
✅ **New secrets generated** (JWT secret + admin password)
✅ **14 packages updated** to secure versions

---

## Your New Admin Password

```
Password: exjpC0v5dIA0J5mJ
```

**⚠️ IMPORTANT**: Change this password immediately after first login!

---

## Quick Start (Choose One Method)

### Option A: Development Mode (Fastest)

```bash
# 1. Install dependencies (will take 5-10 minutes)
npm install

# 2. Install client dependencies
cd client && npm install && cd ..

# 3. Start development server
npm run dev
```

Open http://localhost:5005 and login with password above.

### Option B: Production Mode (Node.js)

```bash
# 1. Install dependencies
npm install

# 2. Build client
cd client && npm install && npm run build && cd ..

# 3. Start server
npm start
```

### Option C: Docker (Recommended for Production)

```bash
# 1. Build image
docker build -t flame:secure -f .docker/Dockerfile .

# 2. Run container
docker run -d \
  -p 5005:5005 \
  -v $(pwd)/data:/app/data \
  -e PASSWORD=exjpC0v5dIA0J5mJ \
  --name flame \
  flame:secure

# 3. Check logs
docker logs -f flame
```

---

## Critical Testing Checklist

After starting the app, test these in order:

### 1. Authentication (CRITICAL - Bug Fix Verification)
- [ ] Login with password `exjpC0v5dIA0J5mJ` - should work
- [ ] Login with wrong password - should be rejected
- [ ] Access protected page without token - should be rejected
- [ ] Access protected page with invalid token - should be rejected (THIS WAS THE BUG!)

### 2. Core Functionality
- [ ] Create a new app bookmark
- [ ] Edit an app bookmark
- [ ] Delete an app bookmark
- [ ] Search works
- [ ] Theme switching works

### 3. Change Password (DO THIS NOW!)
- [ ] Go to Settings
- [ ] Change password to something secure
- [ ] Save in password manager
- [ ] Test login with new password

---

## If Something Breaks

### Rollback to Previous Version

```bash
# Stop the app
npm stop  # or: docker stop flame

# Restore old package files
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# Reinstall old dependencies
rm -rf node_modules
npm install

# Restore old secrets (if needed)
# Edit .env and put back old values

# Restart
npm start
```

---

## Files Changed

### Modified Files
- `package.json` - Updated 14 dependencies
- `.env` - New secrets (DO NOT COMMIT THIS!)
- `.gitignore` - Added .env protection
- `middleware/auth.js` - Fixed authentication bug

### New Files Created
- `.env.example` - Template for environment setup
- `regenerate-secrets.js` - Script to generate new secrets
- `SECURITY_REMEDIATION_LOG.md` - Complete audit log
- `SECURITY_FIXES_SUMMARY.md` - Detailed deployment guide
- `CRITICAL_AUTH_BUG.md` - Bug analysis
- `package.json.backup` - Backup of old versions
- `package-lock.json.backup` - Backup of old lock file

---

## Common Issues

### "Cannot find module 'xyz'"
Run `npm install` again. Some dependencies may not have installed correctly.

### "EACCES: permission denied"
The data folder needs write permissions:
```bash
mkdir -p data
chmod 755 data
```

### "sqlite3 build failed"
Use Docker instead - it handles native modules better:
```bash
docker build -t flame:secure -f .docker/Dockerfile .
```

### "Port 5005 already in use"
Change the port in .env:
```bash
PORT=5006
```

---

## Documentation

- **Quick Start**: This file
- **Complete Details**: SECURITY_FIXES_SUMMARY.md
- **Audit Log**: SECURITY_REMEDIATION_LOG.md
- **Auth Bug Details**: CRITICAL_AUTH_BUG.md

---

## Need Help?

1. Check SECURITY_FIXES_SUMMARY.md for detailed testing checklist
2. Check SECURITY_REMEDIATION_LOG.md for what was changed
3. Check CRITICAL_AUTH_BUG.md for auth bug details

---

## Remember

1. ✅ Test authentication thoroughly (the bug fix is critical)
2. ✅ Change the admin password immediately
3. ✅ Never commit .env to git
4. ✅ Keep secrets in a password manager
5. ✅ Run `npm audit` regularly to check for new vulnerabilities

---

**Status**: ✅ Ready to test
**Next Step**: Run `npm install` and start testing!
