# RELOVE - Setup Guide

🎉 **Your AI-powered relationship recovery coach app is ready!**

This guide will help you set up and run the complete RELOVE application.

---

## 📋 What's Included

- ✅ **6 AI Specialists** (Alex, Sarah, Dr. Marcus, Maya, Lucas, Emma)
- ✅ **iOS-style Dark Mode** Interface
- ✅ **Real-time Chat** with AI experts
- ✅ **Supabase Backend** (PostgreSQL + Auth + Storage)
- ✅ **OpenAI Integration** (with and without ebooks)
- ✅ **Claude AI Integration** (Anthropic)
- ✅ **Screenshot Upload** (ready to implement)
- ✅ **Email/Password Authentication**

---

## 🚀 Quick Start

### Step 1: Set up Supabase Database

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Copy the entire content of `supabase-schema.sql`
3. Paste and run it in the SQL Editor
4. This will create all tables, policies, and insert the 6 specialists

### Step 2: Enable Email Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. (Optional) Configure email templates

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Environment Variables

Your `.env` file is already configured with:
- ✅ OpenAI API Key
- ✅ OpenAI Prompt ID (with 6 ebooks)
- ✅ Claude (Anthropic) API Key
- ✅ Supabase URL and Keys

No changes needed - it's ready to go!

### Step 5: Run the App

```bash
npm run dev
```

The app will start on **http://localhost:5000**

---

## 🎨 How It Works

### Specialists & AI Providers

| Specialist | Role | AI Provider | Has Ebooks? |
|------------|------|-------------|-------------|
| **Alex** | Recovery Coach | OpenAI | ✅ Yes |
| **Sarah** | Text Strategist | OpenAI | ✅ Yes |
| **Dr. Marcus** | Relationship Psychologist | OpenAI | ✅ Yes |
| **Maya** | Momentum Coach | Claude | ❌ No |
| **Lucas** | Social Media Advisor | Claude | ❌ No |
| **Emma** | Emotional Support | OpenAI | ❌ No |

- **OpenAI with ebooks**: Uses your Prompt ID for deep knowledge
- **OpenAI without ebooks**: General GPT-4 responses
- **Claude**: Anthropic's Claude 3.5 Sonnet for empathetic conversations

### User Flow

1. **Sign Up/Sign In** → `/auth`
2. **Choose Specialist** → `/specialists`
3. **Chat with Expert** → `/chat/:specialist-slug`
4. **Get AI-Powered Advice** in real-time

---

## 🎯 Key Features

### ✨ iOS-Style Dark Interface
- Pure black background (#000000)
- iOS blue accents (#007AFF)
- Glassmorphism effects
- Smooth spring animations
- iMessage-style chat bubbles

### 💬 Chat System
- Real-time messaging
- Conversation history (last 10 messages for context)
- Typing indicators
- Read receipts
- Unread message counts

### 🤖 AI Integration
- Smart routing based on specialist
- Context-aware responses
- Personalized system prompts
- Multi-provider support

### 🔐 Authentication
- Supabase Auth (email/password)
- Row Level Security (RLS)
- Protected routes
- Session management

---

## 📱 App Structure

```
reloveai/
├── client/                  # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth.tsx           # Login/Signup
│   │   │   ├── specialists.tsx    # Specialist list
│   │   │   └── chat.tsx           # Chat interface
│   │   ├── hooks/
│   │   │   └── use-supabase-auth.tsx
│   │   └── lib/
│   │       └── supabase.ts
│   └── index.css           # iOS Dark theme
│
├── server/                  # Backend (Node.js + Express)
│   ├── routes/
│   │   ├── auth.ts               # Auth endpoints
│   │   ├── specialists.ts        # Specialist endpoints
│   │   └── chat.ts               # Chat endpoints
│   ├── services/
│   │   └── ai-providers.ts       # OpenAI + Claude
│   └── supabase.ts
│
├── shared/                  # Shared types
│   └── types.ts            # TypeScript types
│
├── .env                    # Environment variables (configured!)
├── supabase-schema.sql     # Database schema
└── SETUP.md               # This file
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/user` - Get current user

### Specialists
- `GET /api/specialists` - List all specialists
- `GET /api/specialists/:id` - Get single specialist

### Chat
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:id/messages` - Get messages
- `POST /api/chat/rooms/:id/messages` - Send message

---

## 📸 Screenshot Upload (TODO)

The upload endpoint is ready at:
```
POST /api/chat/upload
```

To implement:
1. Install `multer` for file uploads
2. Configure Supabase Storage bucket
3. Update frontend to handle file selection
4. Use OpenAI Vision API to analyze screenshots

---

## 🎨 Customization

### Change Specialist Colors

Edit `supabase-schema.sql` and update the specialist colors:

```sql
UPDATE specialists
SET color_primary = '#YOUR_COLOR',
    color_secondary = '#YOUR_COLOR'
WHERE slug = 'specialist-slug';
```

### Add New Specialist

1. Insert into Supabase:
```sql
INSERT INTO specialists (slug, name, role, description, specialty, ai_provider, system_prompt, color_primary, color_secondary, sort_order)
VALUES (...);
```

2. Add welcome message in `client/src/pages/chat.tsx`

### Modify AI Behavior

Edit system prompts in:
- Database: `specialists` table
- Code: `server/services/ai-providers.ts`

---

## 🐛 Troubleshooting

### "Failed to load specialists"
- Check Supabase connection
- Verify SQL schema was run
- Check browser console for errors

### "Unauthorized" errors
- Check `.env` has correct Supabase keys
- Verify user is signed in
- Check RLS policies in Supabase

### AI not responding
- Verify API keys in `.env`
- Check server logs for errors
- Ensure OpenAI/Claude APIs are accessible

---

## 📦 Deployment

### Deploy to Replit

1. Set environment variables in Replit Secrets
2. App will auto-deploy on port 5000

### Deploy to Vercel/Netlify

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables in platform settings

---

## 💰 Future Features (Roadmap)

- [ ] Screenshot upload & analysis
- [ ] Voice messages
- [ ] Push notifications
- [ ] Stripe payment integration
- [ ] Progress tracking dashboard
- [ ] Daily check-ins
- [ ] Achievement system
- [ ] Group coaching sessions

---

## 📞 Support

- **Issues**: Create an issue on GitHub
- **Questions**: Check the code comments
- **Updates**: Pull latest changes

---

## 🎉 You're All Set!

Run `npm run dev` and visit http://localhost:5000 to see your app in action!

Your users will have access to 6 AI relationship recovery experts, all powered by cutting-edge AI and wrapped in a beautiful iOS-style dark interface. 🚀
