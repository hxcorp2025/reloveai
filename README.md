# RELOVE - AI Relationship Recovery Experts

> **Your personal team of AI relationship recovery specialists, available 24/7**

A production-ready, iOS-styled chat application featuring 6 AI specialists powered by OpenAI and Claude AI, designed to help users navigate breakup recovery with expert guidance.

## ✨ What's New (Complete Rebuild)

🎨 **iOS Dark Mode Design** - Beautiful Apple-inspired interface with glassmorphism effects
💬 **Chat-Based Interface** - Natural conversations instead of forms
🤖 **6 AI Specialists** - Each with unique expertise and personality
🔐 **Supabase Backend** - PostgreSQL database with Row Level Security
⚡ **Real-time Messaging** - Live chat with AI experts
🎯 **Hybrid AI** - OpenAI (with ebooks) + Claude for diverse responses

## 🎯 Meet Your Specialists

1. **Alex** - Recovery Coach (OpenAI + Ebooks)
2. **Sarah** - Text Strategist (OpenAI + Ebooks)
3. **Dr. Marcus** - Relationship Psychologist (OpenAI + Ebooks)
4. **Maya** - Momentum Coach (Claude AI)
5. **Lucas** - Social Media Advisor (Claude AI)
6. **Emma** - Emotional Support (OpenAI)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase Database
```bash
# Run the SQL schema in your Supabase SQL Editor
# File: supabase-schema.sql
```

### 3. Environment Variables
```bash
# Already configured in .env
# No changes needed - ready to go!
```

### 4. Run the App
```bash
npm run dev
```

Visit **http://localhost:5000** and start chatting!

📖 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

## 🎨 Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI GPT-4 + Claude 3.5 Sonnet
- **UI**: shadcn/ui + iOS-inspired dark theme

## 📱 Features

- ✅ 6 AI specialists with unique personalities
- ✅ Real-time chat interface
- ✅ iOS-style dark mode design
- ✅ Conversation history & context
- ✅ Typing indicators
- ✅ Email/password authentication
- ✅ Responsive mobile-first design
- ⏳ Screenshot upload (coming soon)
- ⏳ Push notifications (coming soon)

## 🏗️ Architecture

### Specialist AI Providers

- **OpenAI with Ebooks**: Alex, Sarah, Dr. Marcus (access to 6 RELOVE ebooks via Prompt ID)
- **Claude AI**: Maya, Lucas (empathetic, conversational responses)
- **OpenAI Standard**: Emma (general GPT-4 for emotional support)

### Database Schema

- `profiles` - User accounts
- `specialists` - AI specialist configurations
- `chat_rooms` - User-specialist chat rooms
- `messages` - Chat message history
- `user_recovery_profiles` - User recovery progress
- `user_progress` - Daily tracking

## 📂 Project Structure

```
reloveai/
├── client/src/           # React frontend
│   ├── pages/            # App pages
│   ├── components/       # UI components
│   ├── hooks/            # React hooks
│   └── lib/              # Utilities
├── server/               # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── supabase.ts       # DB client
├── shared/               # Shared types
└── supabase-schema.sql   # Database schema
```

## 🎯 Usage

1. **Sign up** with email/password
2. **Choose a specialist** from the list
3. **Start chatting** - ask questions, share situations
4. **Get expert AI advice** tailored to your recovery journey

## 🔐 Security

- Row Level Security (RLS) on all tables
- Server-side API key management
- Protected routes
- Secure session handling

## 📝 License

MIT

---

Built with ❤️ for helping people heal and grow
