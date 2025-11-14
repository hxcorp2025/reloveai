import { z } from "zod";

// ================================================
// SPECIALIST TYPES
// ================================================

export const SpecialistSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  role: z.string(),
  description: z.string(),
  avatar_url: z.string().nullable().optional(),
  specialty: z.string(),
  ai_provider: z.enum(['openai', 'openai_ebooks', 'claude']),
  system_prompt: z.string(),
  color_primary: z.string(),
  color_secondary: z.string(),
  is_active: z.boolean(),
  sort_order: z.number(),
  created_at: z.string(),
});

export type Specialist = z.infer<typeof SpecialistSchema>;

// ================================================
// CHAT & MESSAGE TYPES
// ================================================

export const ChatRoomSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  specialist_id: z.string().uuid(),
  last_message_at: z.string(),
  unread_count: z.number(),
  is_archived: z.boolean(),
  created_at: z.string(),
});

export type ChatRoom = z.infer<typeof ChatRoomSchema>;

export const MessageAttachmentSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.enum(['image', 'file']),
  name: z.string(),
  size: z.number().optional(),
});

export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;

export const MessageSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  sender_type: z.enum(['user', 'specialist']),
  content: z.string(),
  attachments: z.array(MessageAttachmentSchema).optional(),
  metadata: z.record(z.any()).optional(),
  read_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

// ================================================
// USER PROFILE TYPES
// ================================================

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserRecoveryProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  breakup_date: z.string().nullable().optional(),
  relationship_length_months: z.number().nullable().optional(),
  recovery_stage: z.enum(['early', 'middle', 'advanced', 'recovered']),
  current_day: z.number(),
  emotional_score: z.number().min(1).max(10).nullable().optional(),
  preferences: z.record(z.any()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserRecoveryProfile = z.infer<typeof UserRecoveryProfileSchema>;

// ================================================
// API REQUEST/RESPONSE TYPES
// ================================================

export const SendMessageRequestSchema = z.object({
  room_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  attachments: z.array(MessageAttachmentSchema).optional(),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const SendMessageResponseSchema = z.object({
  user_message: MessageSchema,
  specialist_message: MessageSchema,
});

export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;

export const GetMessagesRequestSchema = z.object({
  room_id: z.string().uuid(),
  limit: z.number().optional().default(50),
  before: z.string().uuid().optional(),
});

export type GetMessagesRequest = z.infer<typeof GetMessagesRequestSchema>;

export const CreateChatRoomRequestSchema = z.object({
  specialist_id: z.string().uuid(),
});

export type CreateChatRoomRequest = z.infer<typeof CreateChatRoomRequestSchema>;

// ================================================
// AUTH TYPES
// ================================================

export const SignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  full_name: z.string().optional(),
});

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;

export const SignInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInRequest = z.infer<typeof SignInRequestSchema>;

export const AuthResponseSchema = z.object({
  user: UserProfileSchema,
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
    expires_at: z.number().optional(),
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ================================================
// SPECIALIST DATA (Frontend)
// ================================================

export interface SpecialistWithLastMessage extends Specialist {
  lastMessage?: {
    content: string;
    timestamp: string;
    unreadCount: number;
  };
  roomId?: string;
}
