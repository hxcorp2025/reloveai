// Storage interface for RELOVE AI application with database persistence
import { 
  users, userProfiles, coachingSessions, progressTracking, notificationSettings,
  type User, type InsertUser, type UserProfile, type InsertUserProfile,
  type CoachingSession, type InsertCoachingSession, type ProgressTracking, type InsertProgressTracking,
  type NotificationSettings, type InsertNotificationSettings
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: Omit<InsertUser, 'password'> & { passwordHash: string }): Promise<User>;
  
  // User profiles
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Coaching sessions
  createCoachingSession(insertSession: InsertCoachingSession): Promise<CoachingSession>;
  getUserSessions(userId: number, sessionType?: string): Promise<CoachingSession[]>;
  getRecentSessions(userId: number, limit?: number): Promise<CoachingSession[]>;
  
  // Progress tracking
  createProgressEntry(insertProgress: InsertProgressTracking): Promise<ProgressTracking>;
  getUserProgress(userId: number, startDate?: Date, endDate?: Date): Promise<ProgressTracking[]>;
  getLatestProgress(userId: number): Promise<ProgressTracking | undefined>;
  
  // Notification settings
  getUserNotificationSettings(userId: number): Promise<NotificationSettings | undefined>;
  createNotificationSettings(insertSettings: InsertNotificationSettings): Promise<NotificationSettings>;
  updateNotificationSettings(userId: number, updates: Partial<InsertNotificationSettings>): Promise<NotificationSettings>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: Omit<InsertUser, 'password'> & { passwordHash: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  async createCoachingSession(insertSession: InsertCoachingSession): Promise<CoachingSession> {
    const [session] = await db
      .insert(coachingSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getUserSessions(userId: number, sessionType?: string): Promise<CoachingSession[]> {
    if (sessionType) {
      return await db
        .select()
        .from(coachingSessions)
        .where(and(
          eq(coachingSessions.userId, userId),
          eq(coachingSessions.sessionType, sessionType)
        ))
        .orderBy(desc(coachingSessions.createdAt));
    }
    
    return await db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(coachingSessions.createdAt));
  }

  async getRecentSessions(userId: number, limit: number = 10): Promise<CoachingSession[]> {
    return await db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(coachingSessions.createdAt))
      .limit(limit);
  }

  async createProgressEntry(insertProgress: InsertProgressTracking): Promise<ProgressTracking> {
    const [progress] = await db
      .insert(progressTracking)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async getUserProgress(userId: number, startDate?: Date, endDate?: Date): Promise<ProgressTracking[]> {
    let conditions = [eq(progressTracking.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(progressTracking.date, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(progressTracking.date, endDate));
    }
    
    return await db
      .select()
      .from(progressTracking)
      .where(and(...conditions))
      .orderBy(desc(progressTracking.date));
  }

  async getLatestProgress(userId: number): Promise<ProgressTracking | undefined> {
    const [progress] = await db
      .select()
      .from(progressTracking)
      .where(eq(progressTracking.userId, userId))
      .orderBy(desc(progressTracking.date))
      .limit(1);
    return progress || undefined;
  }

  async getUserNotificationSettings(userId: number): Promise<NotificationSettings | undefined> {
    const [settings] = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
    return settings || undefined;
  }

  async createNotificationSettings(insertSettings: InsertNotificationSettings): Promise<NotificationSettings> {
    const [settings] = await db
      .insert(notificationSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateNotificationSettings(userId: number, updates: Partial<InsertNotificationSettings>): Promise<NotificationSettings> {
    const [settings] = await db
      .update(notificationSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notificationSettings.userId, userId))
      .returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();
