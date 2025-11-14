import type { GreenlightRequest, GreenlightResponse } from "@shared/schema";

const NEXT_STEPS = {
  red: [
    "Focus on self-care activities. Journal about your feelings and work on personal projects.",
    "Take this time to reconnect with friends and family. Build your support network.",
    "Engage in physical activities like gym, sports, or long walks to process emotions.",
    "Work on personal development - read, learn new skills, pursue hobbies.",
    "Practice mindfulness and meditation to center yourself emotionally."
  ],
  yellow: [
    "Continue personal growth but start preparing for potential contact.",
    "Reflect on what you want to communicate and practice staying centered.",
    "Focus on activities that build confidence and positive energy.",
    "Consider what value you can bring to the interaction when the time comes.",
    "Maintain emotional stability while staying open to opportunities."
  ],
  green: [
    "You can reach out with a light, positive message focused on sharing value.",
    "Keep the message brief, positive, and free from pressure or neediness.",
    "Share something interesting or ask about something they mentioned before.",
    "Maintain confident, relaxed energy in your communication.",
    "Be prepared to give space if they don't respond immediately."
  ]
};

export function checkGreenlight(request: GreenlightRequest): GreenlightResponse {
  const { scenario, silence_hours, last_response_from_her, relapse_today, emotional_checkin } = request;
  
  const riskFlags: string[] = [];
  
  // Immediate red flags
  if (relapse_today) {
    riskFlags.push("relapse");
    return {
      light: "red",
      reason: "You had a relapse today. Wait until you're in a better emotional state.",
      wait_hours: 48,
      next_step: NEXT_STEPS.red[Math.floor(Math.random() * NEXT_STEPS.red.length)],
      risk_flags: riskFlags
    };
  }

  if (scenario === "blocked") {
    riskFlags.push("blocked");
    return {
      light: "red",
      reason: "You're blocked. Any attempt to contact will make things worse.",
      wait_hours: 0, // Indefinite
      next_step: "Focus completely on personal growth. Blocked status requires significant time and change before any hope of reconnection.",
      risk_flags: riskFlags
    };
  }

  if (emotional_checkin === "triggered" || emotional_checkin === "emotional") {
    riskFlags.push("emotional_instability");
    return {
      light: "red",
      reason: "Your emotional state is not stable enough for healthy communication.",
      wait_hours: 24,
      next_step: NEXT_STEPS.red[Math.floor(Math.random() * NEXT_STEPS.red.length)],
      risk_flags: riskFlags
    };
  }

  // Time-based checks
  if (silence_hours < 24) {
    return {
      light: "red",
      reason: "Not enough time has passed since last contact. Patience is key.",
      wait_hours: 24 - silence_hours,
      next_step: "Use this time productively for self-improvement activities.",
      risk_flags: riskFlags
    };
  }

  // Negative response handling
  if (last_response_from_her === "negative") {
    if (silence_hours < 72) {
      return {
        light: "red",
        reason: "Last response was negative. Need more time to let emotions cool.",
        wait_hours: 72 - silence_hours,
        next_step: NEXT_STEPS.red[Math.floor(Math.random() * NEXT_STEPS.red.length)],
        risk_flags: riskFlags
      };
    } else {
      return {
        light: "yellow",
        reason: "Enough time has passed since negative response, but proceed with extreme caution.",
        wait_hours: 0,
        next_step: "If you do reach out, make it very light and value-focused. Be prepared for no response.",
        risk_flags: riskFlags
      };
    }
  }

  // Green light conditions
  if (last_response_from_her === "positive" && 
      silence_hours >= 48 && 
      emotional_checkin === "calm") {
    return {
      light: "green",
      reason: "Great timing! Last response was positive, you've given appropriate space, and you're in a good headspace.",
      wait_hours: 0,
      next_step: NEXT_STEPS.green[Math.floor(Math.random() * NEXT_STEPS.green.length)],
      risk_flags: riskFlags
    };
  }

  // Neutral territory with good conditions
  if (last_response_from_her === "neutral" && 
      silence_hours >= 48 && 
      emotional_checkin === "calm") {
    return {
      light: "yellow",
      reason: "Conditions are decent but not optimal. You could reach out but keep expectations low.",
      wait_hours: 0,
      next_step: NEXT_STEPS.yellow[Math.floor(Math.random() * NEXT_STEPS.yellow.length)],
      risk_flags: riskFlags
    };
  }

  // No response scenarios
  if (last_response_from_her === "none") {
    if (silence_hours < 72) {
      return {
        light: "red",
        reason: "They haven't responded to your last message. Give it more time.",
        wait_hours: 72 - silence_hours,
        next_step: "Silence is a response. Focus on yourself and let them process.",
        risk_flags: riskFlags
      };
    } else if (silence_hours >= 168) { // 1 week
      return {
        light: "yellow",
        reason: "It's been a week with no response. You could try once more but keep it very light.",
        wait_hours: 0,
        next_step: "If you reach out, make it completely pressure-free and be prepared for continued silence.",
        risk_flags: riskFlags
      };
    } else {
      return {
        light: "red",
        reason: "Still too soon after no response. Patience shows strength.",
        wait_hours: 168 - silence_hours,
        next_step: NEXT_STEPS.red[Math.floor(Math.random() * NEXT_STEPS.red.length)],
        risk_flags: riskFlags
      };
    }
  }

  // Default yellow light
  return {
    light: "yellow",
    reason: "Conditions are mixed. Proceed with caution if you choose to reach out.",
    wait_hours: 12,
    next_step: NEXT_STEPS.yellow[Math.floor(Math.random() * NEXT_STEPS.yellow.length)],
    risk_flags: riskFlags
  };
}
