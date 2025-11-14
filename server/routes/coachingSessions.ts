import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Get user's coaching session history
router.get("/", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const sessionType = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 20;

    const sessions = sessionType 
      ? await storage.getUserSessions(req.user.id, sessionType)
      : await storage.getRecentSessions(req.user.id, limit);

    res.json(sessions);
  } catch (error) {
    console.error("Failed to fetch coaching sessions:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
});

// Get session statistics for user
router.get("/stats", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const allSessions = await storage.getUserSessions(req.user.id);
    
    // Calculate statistics
    const stats = {
      total: allSessions.length,
      daily_action: allSessions.filter(s => s.sessionType === 'daily_action').length,
      safe_text: allSessions.filter(s => s.sessionType === 'safe_text').length,
      greenlight: allSessions.filter(s => s.sessionType === 'greenlight').length,
      ai_agent: allSessions.filter(s => s.sessionType === 'ai_agent').length,
      most_recent: allSessions[0]?.createdAt || null,
      sessions_today: allSessions.filter(s => {
        const today = new Date();
        const sessionDate = new Date(s.createdAt);
        return sessionDate.toDateString() === today.toDateString();
      }).length
    };

    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch session statistics:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
});

export default router;