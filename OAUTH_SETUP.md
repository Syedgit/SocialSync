# OAuth Setup Guide

This guide explains how to set up OAuth for different social media platforms.

## Required Environment Variables

Add these to your `backend/.env` file:

### Facebook
```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:5173/dashboard/oauth/facebook/callback
```

### Twitter/X
```env
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_REDIRECT_URI=http://localhost:5173/dashboard/oauth/twitter/callback
```

### LinkedIn
```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:5173/dashboard/oauth/linkedin/callback
```

### General
```env
FRONTEND_URL=http://localhost:5173
```

## Setting Up OAuth Apps

### 1. Facebook

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. In Settings → Basic:
   - Add your App Domains
   - Add Platform → Website: Site URL
5. In Products → Facebook Login → Settings:
   - Add Valid OAuth Redirect URIs: `http://localhost:5173/dashboard/oauth/facebook/callback`
   - Add `http://localhost:3000/dashboard/oauth/facebook/callback` for production
6. Get your App ID and App Secret
7. Request permissions: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`, `business_management`

### 2. Twitter/X

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. In App Settings:
   - Enable OAuth 2.0
   - Set Callback URI: `http://localhost:5173/dashboard/oauth/twitter/callback`
   - Request scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`
4. Get your Client ID and Client Secret
5. Note: You need to apply for Elevated Access for write permissions

### 3. LinkedIn

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. In Auth tab:
   - Add Redirect URLs: `http://localhost:5173/dashboard/oauth/linkedin/callback`
   - Request scopes: `r_liteprofile`, `r_emailaddress`, `w_member_social`
4. Get your Client ID and Client Secret
5. Apply for Marketing Developer Platform access for posting capabilities

### 4. Instagram

Instagram uses Facebook's OAuth system. If you've set up Facebook:
1. Connect your Instagram Business account to your Facebook Page
2. The Facebook OAuth flow will also handle Instagram
3. Additional permissions may be needed in Facebook App settings

### 5. TikTok

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Create an app
3. Set up OAuth 2.0
4. Add redirect URI
5. Request scopes for posting

### 6. Pinterest

1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Create an app
3. Set up OAuth
4. Add redirect URI
5. Request scopes

### 7. YouTube

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

## Testing OAuth Flow

1. Make sure your backend has the environment variables set
2. Start the backend: `npm run start:dev` in `backend/`
3. Start the frontend: `npm run dev` in `frontend/`
4. Go to `/dashboard/connect`
5. Click "Connect Account" on any platform
6. You'll be redirected to the platform's OAuth page
7. After authorization, you'll be redirected back to `/dashboard/oauth/{platform}/callback`
8. The account will be saved and you'll be redirected to `/dashboard/accounts`

## Production Setup

For production, update:
- All redirect URIs to your production domain
- Environment variables with production credentials
- OAuth app settings in each platform's developer portal
- Enable HTTPS (required by most platforms)

## Troubleshooting

### "Invalid redirect URI"
- Make sure the redirect URI in your `.env` matches exactly with the one in the OAuth app settings
- Check for trailing slashes
- Verify the protocol (http vs https)

### "Invalid client credentials"
- Double-check your Client ID and Client Secret
- Make sure they're copied correctly (no extra spaces)

### "Insufficient permissions"
- Verify you've requested the correct scopes in the OAuth app
- Some platforms require app review for certain permissions

### "Token exchange failed"
- Check that your redirect URI matches exactly
- Verify your client secret is correct
- Some platforms have rate limits on token exchanges

## Security Notes

- Never commit your OAuth secrets to version control
- Use environment variables for all sensitive data
- Rotate secrets periodically
- Use HTTPS in production
- Implement token refresh logic for platforms that support it
- Store tokens encrypted in the database

