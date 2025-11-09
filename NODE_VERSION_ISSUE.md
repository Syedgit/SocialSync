# Node.js Version Issue

## Problem
You're running Node.js v14.17.2, but NestJS 10 requires Node.js 18.0.0 or higher.

## Solution Options

### Option 1: Upgrade Node.js (Recommended)

**Using nvm (Node Version Manager):**

1. Install nvm if you don't have it:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

2. Restart your terminal or run:
```bash
source ~/.zshrc
```

3. Install Node.js 18:
```bash
nvm install 18
nvm use 18
nvm alias default 18
```

4. Verify:
```bash
node --version
# Should show v18.x.x or higher
```

5. Reinstall dependencies:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Option 2: Use ts-node-dev (Temporary Workaround)

I've added `ts-node-dev` as an alternative. Try:

```bash
cd backend
npm run start:dev
```

This might work, but you may still encounter issues with other dependencies.

### Option 3: Downgrade NestJS (Not Recommended)

This would require changing many dependencies and is not recommended.

---

## Recommended Action

**Upgrade to Node.js 18+** - This is the proper solution and will prevent future compatibility issues.

After upgrading:
1. Delete `node_modules` and `package-lock.json` in backend
2. Run `npm install` again
3. Start the server with `npm run start:dev`

---

## Check Current Node Version
```bash
node --version
```

## Check Required Version
NestJS 10 requires: Node.js >= 18.0.0

