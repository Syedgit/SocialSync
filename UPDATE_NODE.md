# Node.js Upgrade Guide

## ✅ Node.js Updated!

You now have Node.js 18+ installed via nvm.

## 🔧 Make Node 18 Default (Permanent)

To make Node.js 18 the default for new terminals, add this to your `~/.zshrc`:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Then reload:
```bash
source ~/.zshrc
```

## 🚀 Next Steps

1. **Reinstall Backend Dependencies:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

2. **Start Backend:**
```bash
npm run start:dev
```

3. **Verify Node Version:**
```bash
node --version
# Should show v18.x.x or higher
```

## 📝 Quick Commands

**Switch Node versions:**
```bash
nvm use 18
```

**List installed versions:**
```bash
nvm list
```

**Install latest LTS:**
```bash
nvm install --lts
```

---

**You're all set!** Node.js 18+ is now installed and ready to use! 🎉

