import { Router } from "express";
import { safeTextRequestSchema } from "@shared/schema";
import { rewriteSafeText } from "../lib/rules/safeText";
import { storage } from "../storage";
import OpenAI from "openai";

const router = Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;

async function rewriteWithOpenAI(text: string): Promise<any> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: "You are a text safety expert for breakup recovery. Analyze the text for neediness, pressure, manipulation, and other risky patterns. Rewrite it to be confident, light, and attractive. Return JSON with: score (0-10, higher is safer), issues (array of problems found), rewritten (the improved text), alternatives (2 alternative rewrites), notes (array of improvement tips)."
      },
      {
        role: "user",
        content: `Analyze and rewrite this text safely: "${text}"`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

router.post("/", async (req, res) => {
  try {
    const validatedRequest = safeTextRequestSchema.parse(req.body);
    let response;
    
    // Check if we should use OpenAI
    const useOpenAI = process.env.USE_OPENAI_SAFE === "true";
    
    if (useOpenAI && openai) {
      try {
        response = await rewriteWithOpenAI(validatedRequest.text);
      } catch (openaiError) {
        console.error("OpenAI error, falling back to rules:", openaiError);
        // Fall back to rule-based system
        response = rewriteSafeText(validatedRequest);
      }
    } else {
      // Use rule-based system
      response = rewriteSafeText(validatedRequest);
    }
    
    // Save session to database if user is authenticated
    if (req.isAuthenticated() && req.user) {
      try {
        console.log("Saving safe text session for user:", req.user.id);
        await storage.createCoachingSession({
          userId: req.user.id,
          sessionType: 'safe_text',
          request: validatedRequest,
          response: response,
        });
        console.log("Safe text session saved successfully");
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
