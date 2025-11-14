import type { DailyActionRequest, DailyActionResponse } from "@shared/schema";

const MISSIONS: Array<{
  title: string;
  content: string;
  category: "selfcare" | "growth" | "social" | "physical";
}> = [
  {
    title: "Mindful Morning Routine",
    content: "Start your day with 20 minutes of journaling and meditation. Focus on gratitude and your personal growth goals.",
    category: "selfcare"
  },
  {
    title: "Physical Activity Challenge",
    content: "Take a 45-minute walk in nature or hit the gym. Physical movement helps process emotions and builds confidence.",
    category: "physical"
  },
  {
    title: "Skill Development Session",
    content: "Dedicate 1 hour to learning something new - a language, instrument, or professional skill. Growth attracts quality people.",
    category: "growth"
  },
  {
    title: "Social Connection Time",
    content: "Reach out to a friend or family member you haven't spoken to in a while. Rebuild your support network.",
    category: "social"
  },
  {
    title: "Creative Expression",
    content: "Engage in creative activities - write, draw, cook, or craft. Channel your emotions into something productive.",
    category: "growth"
  }
];

const MESSAGE_TEMPLATES = {
  light_checkin: [
    "Hey, hope you're having a good week",
    "Just wanted to say hi and see how things are going",
    "Thought of you today - hope all is well"
  ],
  curiosity_based: [
    "Saw something today that reminded me of that conversation we had about [topic]",
    "How did that [project/event] you mentioned turn out?",
    "Just curious - did you end up trying that [restaurant/activity] we talked about?"
  ],
  value_sharing: [
    "Had an interesting experience today that made me think of our discussions",
    "Learned something cool today and thought you might find it interesting too",
    "Just had a small win and wanted to share the positive energy"
  ]
};

export function selectDailyAction(request: DailyActionRequest): DailyActionResponse {
  const { scenario, day_index, last_contact_hours, last_response_from_her, emotional_checkin } = request;

  // Early recovery phase (Days 1-7) - prioritize stability
  if (day_index <= 7) {
    const mission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
    return {
      action: "mission",
      title: mission.title,
      content: mission.content,
      why: "Early recovery phase - building internal stability and self-worth",
      momentum: { type: "create", level: 1 },
      sources: ["No Contact Recovery Guide"]
    };
  }

  // Blocked scenario - always mission or silence
  if (scenario === "blocked") {
    const mission = MISSIONS.find(m => m.category === "selfcare") || MISSIONS[0];
    return {
      action: "mission",
      title: mission.title,
      content: mission.content,
      why: "Communication is blocked - focus on personal development",
      momentum: { type: "regain", level: 1 },
      sources: ["Blocked Contact Recovery"]
    };
  }

  // Emotional state check - if not calm, recommend mission
  if (emotional_checkin !== "calm") {
    const mission = MISSIONS.find(m => m.category === "selfcare") || MISSIONS[0];
    return {
      action: "mission",
      title: mission.title,
      content: mission.content,
      why: "Emotional state not optimal for contact - stabilize first",
      momentum: { type: "regain", level: 1 }
    };
  }

  // Positive response and sufficient time gap - allow message
  if (last_response_from_her === "positive" && last_contact_hours >= 48) {
    const templates = MESSAGE_TEMPLATES.light_checkin;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      action: "message",
      title: "Light Check-in",
      content: template,
      why: "Positive last response and good timing - maintain momentum",
      momentum: { type: "maintain", level: 3 },
      sources: ["Text Chemistry - Momentum Messages"]
    };
  }

  // Neutral response with time gap - curiosity-based message
  if (last_response_from_her === "neutral" && last_contact_hours >= 48) {
    const templates = MESSAGE_TEMPLATES.curiosity_based;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      action: "message",
      title: "Curiosity-Based Outreach",
      content: template,
      why: "Neutral response with time gap - spark interest without pressure",
      momentum: { type: "create", level: 2 },
      sources: ["Conversation Restart Techniques"]
    };
  }

  // Default to mission for all other scenarios
  const mission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
  return {
    action: "mission",
    title: mission.title,
    content: mission.content,
    why: "Conditions not optimal for contact - invest in personal growth",
    momentum: { type: "create", level: 2 }
  };
}
