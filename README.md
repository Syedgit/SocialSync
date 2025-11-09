# SocialSync

**Social Media Management Made Simple & Mobile**

SocialSync is a mobile-first social media management platform that lets you schedule, publish, and analyze posts across Facebook, Instagram, Twitter, LinkedIn, TikTok, Pinterest, and YouTube from one beautiful, intuitive app.

## 📚 Documentation

- **[Competitive Analysis](./COMPETITIVE_ANALYSIS.md)** - Feature comparison with competitors
- **[Value Proposition](./VALUE_PROPOSITION.md)** - Unique selling points and positioning
- **[Feature Roadmap](./FEATURE_ROADMAP.md)** - Planned features and priorities
- **[Marketing Messaging](./MARKETING_MESSAGING.md)** - Copy and messaging guide
- **[AI Features Analysis](./AI_FEATURES_ANALYSIS.md)** - AI features in competitors
- **[AI Features Roadmap](./AI_FEATURES_ROADMAP.md)** - AI implementation plan
- **[AI Setup Guide](./AI_SETUP.md)** - How to set up AI features

## ✨ AI Features

SocialSync includes powerful AI features to help you create better posts:
- **AI Post Generator** - Generate post content from simple prompts
- **AI Hashtag Suggestions** - Get relevant hashtags automatically  
- **AI Content Rewriter** - Improve and rewrite your content

See [AI_SETUP.md](./AI_SETUP.md) for setup instructions.

A comprehensive social media management platform that allows users to post to multiple social media platforms from one centralized tool, supporting individual accounts, enrolled members/brands, marketing campaigns, and advanced scheduling.

## 🎯 Four Core Pillars

1. **Individual Account Posting** - Personal accounts can manage and post to all their connected social media platforms
2. **Enrolled Members/Brand Management** - Organizations, brands, and groups can enroll and manage shared brand pages with multiple team members
3. **Marketing Publishing** - Bulk publishing capabilities for marketing campaigns, including email marketing integration and targeted promotions
4. **Advanced Scheduling** - Daily, weekly, and recurring post scheduling (feature most platforms lack)

## ✨ Key Features

### 1. Multi-Platform Posting
- Post to multiple social media platforms simultaneously from one interface
- Supported platforms (initial):
  - Facebook (Pages, Groups, Personal)
  - Instagram (Business accounts)
  - Twitter/X
  - LinkedIn (Personal, Company pages)
  - TikTok
  - Pinterest
  - YouTube (short descriptions/community posts)

### 2. Account Management
- **Individual Accounts**: Personal users can connect and manage their own social media accounts
- **Brand/Organization Accounts**: Enrolled members can:
  - Create shared brand pages
  - Add multiple team members with different permission levels
  - Manage all connected social accounts (their own + shared brand pages)
  - View unified analytics across all accounts

### 3. Advanced Scheduling
- **Recurring Posts**: Schedule posts daily, weekly, or custom intervals
- **Bulk Scheduling**: Schedule multiple posts at once
- **Time Zone Management**: Automatic time zone handling
- **Best Time Suggestions**: AI-powered optimal posting time recommendations
- **Queue Management**: Visual calendar view of scheduled posts

### 4. Marketing & Campaign Publishing
- **Bulk Publishing**: Publish campaigns to multiple groups/communities simultaneously
- **Email Marketing Integration**: 
  - Import email lists (data purchase integration)
  - Send promotional emails (e.g., "7-11 deals")
  - Track email campaign performance
- **Targeted Promotions**: Segment audiences and run targeted campaigns
- **Campaign Analytics**: Track performance across all channels

### 5. Content Management
- **Media Library**: Upload and manage images, videos, and assets
- **Content Templates**: Reusable post templates for brands
- **Content Calendar**: Visual calendar for planning content
- **Drafts**: Save and edit drafts before publishing

### 6. Analytics & Insights
- **Unified Dashboard**: View all social media metrics in one place
- **Performance Tracking**: Engagement, reach, clicks, and conversions
- **Comparative Analytics**: Compare performance across platforms
- **Custom Reports**: Generate and export reports

### 7. Team Collaboration (For Enrolled Members)
- **Role-Based Access**: Admin, Editor, Viewer permissions
- **Content Approval Workflows**: Review and approve posts before publishing
- **Team Activity Log**: Track who posted what and when
- **Brand Guidelines**: Enforce content guidelines and approval processes

## 🚀 Technology Stack Recommendations

### Frontend
- **Framework**: React.js with TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui or Material-UI
- **State Management**: Zustand or Redux Toolkit
- **Forms**: React Hook Form + Zod validation
- **Calendar/Scheduling UI**: FullCalendar or react-big-calendar

### Backend
- **Runtime**: Node.js with Express.js or NestJS (recommended for scalability)
- **Language**: TypeScript
- **API Style**: RESTful API with GraphQL option for complex queries
- **Authentication**: NextAuth.js or Passport.js
- **OAuth**: For social media platform integrations

### Database
- **Primary Database**: PostgreSQL (for relational data: users, posts, schedules)
- **Caching**: Redis (for session management, rate limiting, queue jobs)
- **File Storage**: AWS S3 or Cloudinary (for media assets)

### Third-Party Integrations
- **Social Media APIs**:
  - Facebook Graph API
  - Instagram Basic Display API / Instagram Graph API
  - Twitter API v2
  - LinkedIn API
  - TikTok Business API
  - Pinterest API
  - YouTube Data API v3

### Background Jobs & Scheduling
- **Job Queue**: BullMQ (Redis-based) scheduler for delayed post publishing
- **Cron Jobs**: node-cron for recurring tasks
- **Webhooks**: Handle platform callbacks and updates

### Email Marketing
- **Email Service**: SendGrid, Mailgun, or AWS SES
- **Email Templates**: MJML or React Email
- **List Management**: Custom implementation or integration with Mailchimp API

### DevOps & Infrastructure
- **Hosting**: AWS, Google Cloud, or Vercel (frontend)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry for error tracking
- **Analytics**: Google Analytics or Mixpanel

### Security
- **Encryption**: bcrypt for passwords, JWT for tokens
- **Rate Limiting**: express-rate-limit
- **API Security**: Helmet.js, CORS configuration
- **Social Media Token Storage**: Encrypted in database

## 📋 Project Structure

```
SocialSync/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # State management
│   │   ├── services/      # API service calls
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── backend/               # Node.js backend API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── jobs/          # Background job handlers
│   │   ├── integrations/  # Social media API integrations
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── shared/                # Shared types/utilities
│   └── types/             # TypeScript types
│
└── docs/                  # Documentation
```

## 🔑 Key Differentiators

1. **Enrolled Members with Shared Accounts**: Unlike most tools, supports shared brand pages where multiple team members can manage all connected social accounts (individual + brand pages) in one unified interface.

2. **Advanced Recurring Scheduling**: Most platforms lack daily/weekly recurring post scheduling - this is a core differentiator.

3. **Marketing Integration**: Built-in email marketing capabilities with data purchase integration for targeted campaigns.

4. **Unified Management**: All connected accounts (personal + shared brand pages) visible and manageable from one dashboard.

## 🎯 MVP Feature Priority

### Phase 1 (MVP)
1. User authentication & account creation
2. Connect 2-3 social media platforms (Facebook, Instagram, Twitter)
3. Single post creation and publishing
4. Basic scheduling (one-time posts)
5. Individual account management

### Phase 2
1. Recurring scheduling (daily/weekly)
2. Brand/organization enrollment
3. Team collaboration features
4. Analytics dashboard
5. Content calendar view

### Phase 3
1. Email marketing integration
2. Bulk publishing
3. Advanced analytics
4. Additional platform integrations
5. Mobile app (optional)

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start database and Redis:**
   
   **With Docker:**
   ```bash
   docker compose up -d
   ```
   
   **Without Docker (macOS):**
   ```bash
   brew install postgresql@15 redis
   brew services start postgresql@15
   brew services start redis
   createdb socialsync
   ```
   
   See [SETUP.md](./SETUP.md) for detailed instructions.

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in both `backend/` and `frontend/` directories
   - Update with your configuration

4. **Run development servers:**
   ```bash
   npm run dev
   ```

   Or separately:
   - Backend: `npm run dev:backend` (http://localhost:3000)
   - Frontend: `npm run dev:frontend` (http://localhost:5173)

## 📝 Development Status

### ✅ Completed
1. ✅ Project structure setup
2. ✅ Database setup with entities
3. ✅ User authentication (signup/login)
4. ✅ OAuth integration (Facebook, Twitter, LinkedIn)
5. ✅ Post creation UI
6. ✅ Account management
7. ✅ Dashboard with stats

### 🚧 In Progress
- Post publishing to social media platforms

### 📋 Next Up
See [TODO.md](./TODO.md) for complete task list and [TASK_TRACKER.md](./TASK_TRACKER.md) for current sprint tasks.

---

## 📚 Documentation

- **[TODO.md](./TODO.md)** - Complete feature list and tasks
- **[TASK_TRACKER.md](./TASK_TRACKER.md)** - Current sprint and active tasks
- **[OAUTH_SETUP.md](./OAUTH_SETUP.md)** - OAuth setup instructions
- **[OAUTH_IMPLEMENTATION.md](./OAUTH_IMPLEMENTATION.md)** - OAuth implementation details
- **[BUILT_FEATURES.md](./BUILT_FEATURES.md)** - Summary of completed features
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Development roadmap

---

**Status**: Foundation Complete ✅ | OAuth Complete ✅ | Building Core Features 🚀
**Version**: 0.2.0
