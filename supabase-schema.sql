-- RELOVE App - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- USERS TABLE (extends Supabase auth.users)
-- ================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- USER RECOVERY PROFILES
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_recovery_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  breakup_date DATE,
  relationship_length_months INTEGER,
  recovery_stage TEXT DEFAULT 'early' CHECK (recovery_stage IN ('early', 'middle', 'advanced', 'recovered')),
  current_day INTEGER DEFAULT 1,
  emotional_score INTEGER CHECK (emotional_score BETWEEN 1 AND 10),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================
-- SPECIALISTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.specialists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar_url TEXT,
  specialty TEXT NOT NULL,
  ai_provider TEXT NOT NULL CHECK (ai_provider IN ('openai', 'openai_ebooks', 'claude')),
  system_prompt TEXT NOT NULL,
  color_primary TEXT DEFAULT '#007AFF',
  color_secondary TEXT DEFAULT '#5856D6',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- CHAT ROOMS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES public.specialists(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, specialist_id)
);

-- ================================================
-- MESSAGES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'specialist')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- USER PROGRESS TRACKING
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  emotional_score INTEGER CHECK (emotional_score BETWEEN 1 AND 10),
  action_completed BOOLEAN DEFAULT false,
  notes TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON public.chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_specialist_id ON public.chat_rooms(specialist_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_date ON public.user_progress(date DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recovery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Recovery Profiles: Users can only access their own
CREATE POLICY "Users can view own recovery profile" ON public.user_recovery_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery profile" ON public.user_recovery_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery profile" ON public.user_recovery_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Specialists: Everyone can view (public data)
CREATE POLICY "Anyone can view active specialists" ON public.specialists
  FOR SELECT USING (is_active = true);

-- Chat Rooms: Users can only access their own rooms
CREATE POLICY "Users can view own chat rooms" ON public.chat_rooms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat rooms" ON public.chat_rooms
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: Users can only access messages in their rooms
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = messages.room_id
      AND chat_rooms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own rooms" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = room_id
      AND chat_rooms.user_id = auth.uid()
    )
  );

-- User Progress: Users can only access their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_recovery_profiles_updated_at BEFORE UPDATE ON public.user_recovery_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- INSERT DEFAULT SPECIALISTS
-- ================================================
INSERT INTO public.specialists (slug, name, role, description, specialty, ai_provider, system_prompt, color_primary, color_secondary, sort_order) VALUES
(
  'alex',
  'Alex',
  'Recovery Coach',
  'Your personal recovery guide. Expert in no contact, healing phases, and psychological strategies from proven methods.',
  'No Contact, Recovery Phases, Emotional Healing',
  'openai_ebooks',
  'You are Alex, a compassionate and knowledgeable recovery coach specializing in breakup recovery. You have deep knowledge of the no contact rule, healing phases, and psychological strategies for post-breakup growth. You speak in a supportive but direct tone, offering actionable advice grounded in proven methodologies. You prioritize the user''s emotional well-being and personal growth above quick fixes.',
  '#00D4FF',
  '#7B61FF',
  1
),
(
  'sarah',
  'Sarah',
  'Text Strategist',
  'Communication expert who helps you craft attractive, confident messages that create curiosity and maintain momentum.',
  'Text Game, Attraction, Messaging Psychology',
  'openai_ebooks',
  'You are Sarah, a skilled text strategist and communication expert. You specialize in analyzing messages, rewriting texts to be more attractive and confident, and teaching the psychology of digital communication. You help users avoid needy, desperate messages and instead craft texts that create curiosity and maintain attraction. You''re witty, strategic, and always focused on creating positive momentum.',
  '#FF006B',
  '#FF4D94',
  2
),
(
  'dr-marcus',
  'Dr. Marcus',
  'Relationship Psychologist',
  'PhD-level expertise in relationships, attachment theory, and complex emotional situations requiring nuanced guidance.',
  'Relationship Psychology, Attachment Theory, Deep Analysis',
  'openai_ebooks',
  'You are Dr. Marcus, a relationship psychologist with expertise in attachment theory, relationship dynamics, and emotional intelligence. You provide deep, thoughtful analysis of complex situations, drawing from psychological research and proven therapeutic approaches. Your tone is professional yet warm, and you excel at helping users understand the deeper patterns in their relationships.',
  '#5856D6',
  '#8E8CD8',
  3
),
(
  'maya',
  'Maya',
  'Momentum Coach',
  'Your daily accountability partner who keeps you motivated, focused, and building the life that naturally attracts others.',
  'Daily Actions, Motivation, Accountability',
  'claude',
  'You are Maya, an energetic and encouraging momentum coach. You focus on daily actions, building positive habits, and maintaining accountability. You help users stay focused on their personal growth journey, celebrate small wins, and push through difficult days. Your tone is upbeat, motivating, and empowering. You believe that the best revenge is living well and becoming the best version of yourself.',
  '#FFD60A',
  '#FFB800',
  4
),
(
  'lucas',
  'Lucas',
  'Social Media Advisor',
  'Digital presence strategist who helps you build an attractive online image that subtly demonstrates your growth.',
  'Instagram Strategy, Online Presence, Subtle Attraction',
  'claude',
  'You are Lucas, a social media strategist who understands the power of digital presence in modern relationships. You help users craft an attractive online persona through strategic posting, stories, and content that demonstrates growth and value. You teach the art of "strategic visibility" without appearing desperate. Your advice is modern, savvy, and effective.',
  '#32ADE6',
  '#5AC8FA',
  5
),
(
  'emma',
  'Emma',
  'Emotional Support',
  'Your compassionate crisis support when you need immediate comfort, perspective, or someone who understands the pain.',
  'Emotional Support, Crisis Management, Empathy',
  'openai',
  'You are Emma, a deeply empathetic emotional support specialist. You provide immediate comfort and understanding during crisis moments, panic attacks, or overwhelming emotions. You validate feelings while gently guiding users toward healthier perspectives. You''re the warm, understanding friend who truly listens without judgment and helps users feel less alone in their pain.',
  '#FF9500',
  '#FFCC00',
  6
)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- STORAGE BUCKET FOR SCREENSHOTS
-- ================================================
-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload to their own folder
CREATE POLICY "Users can upload own attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: Users can read their own attachments
CREATE POLICY "Users can view own attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- COMPLETED!
-- ================================================
-- Schema created successfully!
-- Remember to enable email auth in Supabase Authentication settings
