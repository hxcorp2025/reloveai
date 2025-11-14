import { Router } from "express";
import { greenlightRequestSchema } from "@shared/schema";
import { checkGreenlight } from "../lib/rules/greenlight";
import { storage } from "../storage";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedRequest = greenlightRequestSchema.parse(req.body);
    const response = checkGreenlight(validatedRequest);
    
    // Save session to database if user is authenticated
    if (req.isAuthenticated() && req.user) {
      try {
        console.log("Saving greenlight session for user:", req.user.id);
        await storage.createCoachingSession({
          userId: req.user.id,
          sessionType: 'greenlight',
          request: validatedRequest,
          response: response,
        });
        console.log("Greenlight session saved successfully");
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
