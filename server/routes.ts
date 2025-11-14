import type { Express } from "express";
import { createServer, type Server } from "http";

import { setupAuth } from "./auth";
import healthRouter from "./routes/health";
import selectDailyActionRouter from "./routes/selectDailyAction";
import safeTextRewriteRouter from "./routes/safeTextRewrite";
import greenlightRouter from "./routes/greenlight";
import agentPassthroughRouter from "./routes/agentPassthrough";
import coachingSessionsRouter from "./routes/coachingSessions";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (creates /api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Register API routes
  app.use("/api/health", healthRouter);
  app.use("/api/select_daily_action", selectDailyActionRouter);
  app.use("/api/safetext_rewrite", safeTextRewriteRouter);
  app.use("/api/greenlight", greenlightRouter);
  app.use("/api/agent", agentPassthroughRouter);
  app.use("/api/coaching-sessions", coachingSessionsRouter);

  const httpServer = createServer(app);
  return httpServer;
}
