import type { Express } from "express";
import { createServer, type Server } from "http";

// New Supabase-based routes
import authRouter from "./routes/auth";
import specialistsRouter from "./routes/specialists";
import chatRouter from "./routes/chat";

// Legacy routes (keeping for reference)
import healthRouter from "./routes/health";

export async function registerRoutes(app: Express): Promise<Server> {
  // New authentication routes
  app.use("/api/auth", authRouter);

  // Chat system routes
  app.use("/api/specialists", specialistsRouter);
  app.use("/api/chat", chatRouter);

  // Health check
  app.use("/api/health", healthRouter);

  // Legacy routes (deprecated - keeping for backwards compatibility)
  // app.use("/api/select_daily_action", selectDailyActionRouter);
  // app.use("/api/safetext_rewrite", safeTextRewriteRouter);
  // app.use("/api/greenlight", greenlightRouter);
  // app.use("/api/agent", agentPassthroughRouter);
  // app.use("/api/coaching-sessions", coachingSessionsRouter);

  const httpServer = createServer(app);
  return httpServer;
}
