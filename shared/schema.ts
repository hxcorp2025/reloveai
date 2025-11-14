import { z } from "zod";
import { pgTable, serial, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Database Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  recoveryStage: varchar("recovery_stage", { length: 50 }).default("early").notNull(),
  breakupDate: timestamp("breakup_date"),
  relationshipLength: integer("relationship_length_months"),
  currentDay: integer("current_day").default(1).notNull(),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionType: varchar("session_type", { length: 50 }).notNull(), // 'daily_action', 'safe_text', 'greenlight', 'ai_agent'
  request: jsonb("request").notNull(),
  response: jsonb("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const progressTracking = pgTable("progress_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  emotionalScore: integer("emotional_score"), // 1-10 scale
  actionCompleted: boolean("action_completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dailyCheckins: boolean("daily_checkins").default(true).notNull(),
  progressReminders: boolean("progress_reminders").default(true).notNull(),
  encouragementMessages: boolean("encouragement_messages").default(true).notNull(),
  preferredTime: varchar("preferred_time", { length: 10 }).default("09:00").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  sessions: many(coachingSessions),
  progress: many(progressTracking),
  notifications: one(notificationSettings, {
    fields: [users.id],
    references: [notificationSettings.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const coachingSessionsRelations = relations(coachingSessions, ({ one }) => ({
  user: one(users, {
    fields: [coachingSessions.userId],
    references: [users.id],
  }),
}));

export const progressTrackingRelations = relations(progressTracking, ({ one }) => ({
  user: one(users, {
    fields: [progressTracking.userId],
    references: [users.id],
  }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}));

// Insert and Select schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  password: z.string().min(6).max(100), // Password field for frontend forms
}).omit({ passwordHash: true }); // Remove passwordHash from insert schema
export const selectUserSchema = createSelectSchema(users);
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserProfileSchema = createSelectSchema(userProfiles);
export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({ id: true, createdAt: true });
export const selectCoachingSessionSchema = createSelectSchema(coachingSessions);
export const insertProgressTrackingSchema = createInsertSchema(progressTracking).omit({ id: true, createdAt: true });
export const selectProgressTrackingSchema = createSelectSchema(progressTracking);
export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const selectNotificationSettingsSchema = createSelectSchema(notificationSettings);

// Inferred types
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, 'passwordHash'>; // User data without sensitive fields
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;
export type ProgressTracking = typeof progressTracking.$inferSelect;
export type InsertProgressTracking = z.infer<typeof insertProgressTrackingSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;

// Daily Action Types
export const dailyActionRequestSchema = z.object({
  scenario: z.enum(["hot_cold", "blocked", "no_contact", "breadcrumbs"]),
  day_index: z.number().int().min(1).max(365),
  last_contact_hours: z.number().min(0),
  last_response_from_her: z.enum(["positive", "neutral", "negative", "none"]),
  emotional_checkin: z.enum(["calm", "anxious", "sad", "angry", "hopeful"])
});

export const dailyActionResponseSchema = z.object({
  action: z.enum(["message", "silence", "mission"]),
  title: z.string(),
  content: z.string(),
  why: z.string(),
  momentum: z.object({
    type: z.enum(["create", "maintain", "regain"]),
    level: z.number().int().min(1).max(5)
  }),
  sources: z.array(z.string()).optional()
});

// SafeText Types
export const safeTextRequestSchema = z.object({
  text: z.string().min(1).max(1000)
});

export const safeTextResponseSchema = z.object({
  score: z.number().int().min(0).max(10),
  issues: z.array(z.string()),
  rewritten: z.string(),
  alternatives: z.array(z.string()),
  notes: z.array(z.string())
});

// Greenlight Types
export const greenlightRequestSchema = z.object({
  scenario: z.enum(["hot_cold", "blocked", "no_contact", "normal"]),
  silence_hours: z.number().min(0),
  last_response_from_her: z.enum(["positive", "neutral", "negative", "none"]),
  relapse_today: z.boolean(),
  emotional_checkin: z.enum(["calm", "anxious", "emotional", "triggered"])
});

export const greenlightResponseSchema = z.object({
  light: z.enum(["red", "yellow", "green"]),
  reason: z.string(),
  wait_hours: z.number().min(0),
  next_step: z.string(),
  risk_flags: z.array(z.string())
});

// Agent Passthrough Types
export const agentRequestSchema = z.object({
  input: z.string().min(1).max(2000)
});

export const agentResponseSchema = z.object({
  response: z.string(),
  timestamp: z.string()
});

// Health Check Types
export const healthResponseSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  time: z.string()
});

// Export inferred types
export type DailyActionRequest = z.infer<typeof dailyActionRequestSchema>;
export type DailyActionResponse = z.infer<typeof dailyActionResponseSchema>;
export type SafeTextRequest = z.infer<typeof safeTextRequestSchema>;
export type SafeTextResponse = z.infer<typeof safeTextResponseSchema>;
export type GreenlightRequest = z.infer<typeof greenlightRequestSchema>;
export type GreenlightResponse = z.infer<typeof greenlightResponseSchema>;
export type AgentRequest = z.infer<typeof agentRequestSchema>;
export type AgentResponse = z.infer<typeof agentResponseSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
