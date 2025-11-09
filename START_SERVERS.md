# Starting Servers - Quick Reference

## ✅ Node.js Updated!

Node.js v18.20.8 is now installed and ready to use.

## 🚀 Start Servers

### Option 1: Manual Start (2 Terminals)

**Terminal 1 - Backend:**
```bash
# Load nvm (only needed once per terminal session)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /Users/subhan/Documents/Code/SocialSync/backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
# Load nvm (only needed once per terminal session)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /Users/subhan/Documents/Code/SocialSync/frontend
npm run dev
```

### Option 2: Using npm workspaces (1 Terminal)

```bash
# Load nvm first
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /Users/subhan/Documents/Code/SocialSync
npm run dev
```

## 🔍 Verify Servers

### Backend
- URL: http://localhost:3000/api/health
- Should return: `{"status":"ok","timestamp":"...","service":"socialsync-backend"}`

### Frontend
- URL: http://localhost:5173
- Should show the SocialSync landing page

## 📝 Making nvm Permanent

nvm has been added to your `~/.zshrc`. To use it in new terminals:

1. **Close and reopen your terminal**, OR
2. **Run:** `source ~/.zshrc`

After that, Node.js 18 will be available automatically!

## ✅ Quick Test

1. Open: http://localhost:5173
2. Click "Sign up"
3. Create a test account
4. You should be redirected to the dashboard!

---

**Servers are ready to test!** 🎉

