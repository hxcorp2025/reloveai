export interface OpenAIConfig {
  apiKey: string;
  promptId: string;
  useOpenAISafe: boolean;
}

export interface RuleContext {
  dayIndex: number;
  scenario: string;
  lastContactHours: number;
  lastResponse: string;
  emotionalState: string;
  silenceHours?: number;
  relapseToday?: boolean;
}

export interface TextAnalysis {
  hasNeediness: boolean;
  hasPressure: boolean;
  hasUltimatums: boolean;
  hasJealousy: boolean;
  hasBegging: boolean;
  hasManipulation: boolean;
  score: number;
}

export interface MissionType {
  activity: string;
  description: string;
  duration: string;
  category: "selfcare" | "growth" | "social" | "physical";
}
