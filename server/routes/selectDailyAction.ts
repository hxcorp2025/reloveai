import { Router } from "express";
import { dailyActionRequestSchema } from "@shared/schema";
import { selectDailyAction } from "../lib/rules/dailyAction";
import { storage } from "../storage";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedRequest = dailyActionRequestSchema.parse(req.body);
    const response = selectDailyAction(validatedRequest);
    
    // Save session to database if user is authenticated
    console.log("Authentication check - isAuthenticated():", req.isAuthenticated(), "user:", req.user ? `ID: ${req.user.id}` : "null");
    if (req.isAuthenticated() && req.user) {
      try {
        console.log("Saving daily action session for user:", req.user.id);
        await storage.createCoachingSession({
          userId: req.user.id,
          sessionType: 'daily_action',
          request: validatedRequest,
          response: response,
        });
        console.log("Daily action session saved successfully");
      } catch (dbError) {
        console.error("Failed to save coaching session:", dbError);
        // Don't fail the request if database save fails
      }
    } else {
      console.log("User not authenticated, skipping session save");
    }
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.issues 
      });
    } else {
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  }
});

export default router;
