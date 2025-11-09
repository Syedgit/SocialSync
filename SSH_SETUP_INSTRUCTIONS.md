# SSH Key Setup for GitHub

## ✅ SSH Key Generated

Your SSH key has been generated at:
- **Private Key**: `~/.ssh/id_ed25519` (keep this secret!)
- **Public Key**: `~/.ssh/id_ed25519.pub`

## 📋 Your Public Key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJdWhrXBxWU4OTCc0y92Hrrk0J/j2yZCYBlCDz6gG6Aj github
```

## 🔧 Steps to Add SSH Key to GitHub

1. **Copy the public key above** (the entire line starting with `ssh-ed25519`)

2. **Go to GitHub Settings**:
   - Visit: https://github.com/settings/keys
   - Or: GitHub → Settings → SSH and GPG keys

3. **Add New SSH Key**:
   - Click "New SSH key"
   - **Title**: "MacBook Pro" (or any name you prefer)
   - **Key**: Paste the public key
   - Click "Add SSH key"

4. **Test the Connection**:
   ```bash
   ssh -T git@github.com
   ```
   You should see: "Hi Syedgit! You've successfully authenticated..."

5. **Push to GitHub**:
   ```bash
   git push origin dev
   ```

## 🚀 Quick Push Command

Once you've added the key to GitHub, run:
```bash
git push origin dev
```

## 📝 Alternative: Use HTTPS with Token

If you prefer HTTPS, you can switch back:
```bash
git remote set-url origin https://github.com/Syedgit/SocialSync.git
```

Then use a Personal Access Token as your password when pushing.

