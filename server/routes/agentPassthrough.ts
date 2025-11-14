import { Router } from "express";
import { agentRequestSchema } from "@shared/schema";
import { storage } from "../storage";
import OpenAI from "openai";

const router = Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;

async function runAssistant(input: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API not configured");
  }

  const assistantId = process.env.ASSISTANT_ID;
  if (!assistantId) {
    throw new Error("Assistant ID not configured");
  }

  console.log("Creating thread for assistant:", assistantId);

  try {
    // Create a thread
    const thread = await openai.beta.threads.create();
    console.log("Thread created with ID:", thread.id);

    if (!thread?.id) {
      throw new Error("Failed to create thread - no ID returned");
    }

    // Add user message to thread
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: input
    });
    console.log("Message added to thread:", thread.id, "Message ID:", message.id);

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });
    console.log("Run created with ID:", run.id, "for thread:", thread.id);

    if (!run?.id) {
      throw new Error("Failed to create run - no ID returned");
    }

    // Poll until run is complete
    let runStatus = run;
    console.log("Initial run status:", runStatus.status);
    
    while (runStatus.status === "queued" || runStatus.status === "in_progress") {
      console.log("Polling run status:", runStatus.status);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      console.log("Updated run status:", runStatus.status);
    }

    console.log("Final run status:", runStatus.status);

    if (runStatus.status === "completed") {
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id);
      console.log("Retrieved", messages.data.length, "messages from thread");
      
      const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
      console.log("Found", assistantMessages.length, "assistant messages");
      
      if (assistantMessages.length > 0) {
        const lastMessage = assistantMessages[0];
        console.log("Last message content type:", lastMessage.content[0]?.type);
        
        if (lastMessage.content[0]?.type === "text" && lastMessage.content[0]?.text?.value) {
          const response = lastMessage.content[0].text.value;
          console.log("Assistant response received, length:", response.length);
          return response;
        }
      }
      throw new Error("No assistant message found in completed run");
    } else if (runStatus.status === "failed") {
      console.log("Run failed. Last error:", runStatus.last_error);
      throw new Error(`Assistant run failed: ${runStatus.last_error?.message || "Unknown error"}`);
    }

    throw new Error(`Assistant run ended with status: ${runStatus.status}`);
  } catch (error) {
    console.error("Error in runAssistant:", error);
    throw error;
  }
}

router.post("/", async (req, res) => {
  try {
    console.log("=== AI Agent Request Started ===");
    console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
    console.log("ASSISTANT_ID exists:", !!process.env.ASSISTANT_ID);
    console.log("ASSISTANT_ID value:", process.env.ASSISTANT_ID);
    
    const validatedRequest = agentRequestSchema.parse(req.body);
    console.log("Request validated, input length:", validatedRequest.input.length);
    
    if (!openai) {
      console.log("OpenAI client not configured");
      return res.status(500).json({ 
        message: "OpenAI API not configured" 
      });
    }

    let aiMessage: string;
    
    try {
      console.log("About to call runAssistant...");
      // Use the RELOVE COACH assistant
      aiMessage = await runAssistant(validatedRequest.input);
      console.log("runAssistant completed successfully");
    } catch (assistantError) {
      console.error("Assistant API error:", assistantError);
      console.error("Error stack:", assistantError instanceof Error ? assistantError.stack : "No stack");
      aiMessage = "The AI could not provide an answer. Please try again later.";
    }

    const agentResponse = {
      response: aiMessage,
      timestamp: new Date().toISOString()
    };

    // Save session to database if user is authenticated
    if (req.isAuthenticated() && req.user) {
      try {
        console.log("Saving AI agent session for user:", req.user.id);
        await storage.createCoachingSession({
          userId: req.user.id,
          sessionType: 'ai_agent',
          request: validatedRequest,
          response: agentResponse,
        });
        console.log("AI agent session saved successfully");
      } catch (dbError) {
        console.error("Failed to save coaching session:", dbError);
        // Don't fail the request if database save fails
      }
    } else {
      console.log("User not authenticated, skipping session save");
    }

    res.json(agentResponse);
  } catch (error) {
    console.error("Agent passthrough error:", error);
    
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.issues 
      });
    } else {
      res.status(500).json({ 
        message: "Failed to process AI request",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
});

export default router;
