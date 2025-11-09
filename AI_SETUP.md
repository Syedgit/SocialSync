# AI Features Setup Guide

## Overview

SocialSync now includes AI-powered features to help you create better social media posts:
- ✨ **AI Post Generator** - Generate post content from simple prompts
- 🏷️ **AI Hashtag Suggestions** - Get relevant hashtags automatically
- ✏️ **AI Content Rewriter** - Improve and rewrite your content

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy your API key (you'll only see it once!)

### 2. Add API Key to Backend

1. Open `backend/.env` file (create it if it doesn't exist)
2. Add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

3. Save the file
4. Restart your backend server

### 3. Test AI Features

1. Navigate to `/dashboard/posts/create`
2. Click "AI Generate" button
3. Enter a prompt (e.g., "Announcing our new product launch")
4. Select a tone (Professional, Casual, Friendly, Humorous)
5. Click "Generate Post Variations"
6. Select a variation to use

## How It Works

### AI Post Generator
- Enter a simple prompt about what you want to post
- AI generates 3-5 variations optimized for your selected platforms
- Choose the best variation for your post

### AI Hashtag Suggestions
- Automatically suggests hashtags as you type (after 10+ characters)
- Platform-specific recommendations
- Click hashtags to add them to your post
- Or click "Add All" to add all suggestions

### AI Content Rewriter
- Click "Improve" button when you have content
- AI rewrites your content to be more engaging
- Maintains your message while improving clarity and tone

## Cost Considerations

- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Average cost per post generation**: ~$0.01-0.03
- **Average cost per hashtag suggestion**: ~$0.001-0.002

**Estimated monthly costs for 1000 active users:**
- 10 AI posts per user/month = $100-300/month
- Includes post generation + hashtag suggestions

## Pricing Strategy

Consider implementing usage limits:
- **Free tier**: 10 AI posts/month
- **Starter ($9/mo)**: 100 AI posts/month
- **Professional ($29/mo)**: Unlimited AI posts

## Troubleshooting

### "OpenAI API key not configured" error
- Make sure `OPENAI_API_KEY` is set in `backend/.env`
- Restart the backend server after adding the key

### "Failed to generate post" error
- Check your OpenAI API key is valid
- Verify you have credits in your OpenAI account
- Check backend logs for detailed error messages

### Hashtag suggestions not appearing
- Make sure you have at least 10 characters in your post
- Ensure at least one platform is selected
- Check browser console for errors

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Test AI features
3. ⏭️ Add usage tracking/limits
4. ⏭️ Add caching for common prompts
5. ⏭️ Implement cost monitoring

## API Documentation

### Backend Endpoints

**POST /api/ai/generate-post**
```json
{
  "prompt": "Announcing new product launch",
  "tone": "friendly",
  "platforms": ["facebook", "instagram"]
}
```

**POST /api/ai/suggest-hashtags**
```json
{
  "content": "Check out our new coffee blend!",
  "platform": "instagram"
}
```

**POST /api/ai/rewrite**
```json
{
  "content": "We're excited to launch our new product!",
  "tone": "professional",
  "platform": "linkedin"
}
```

## Security Notes

- API key is stored server-side only
- All AI requests require authentication
- Rate limiting recommended for production
- Consider caching responses to reduce costs

