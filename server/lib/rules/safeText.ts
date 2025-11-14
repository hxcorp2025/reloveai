import type { SafeTextRequest, SafeTextResponse } from "@shared/schema";
import type { TextAnalysis } from "../types";

const RISKY_PATTERNS = {
  neediness: [
    /please reply/gi,
    /need you/gi,
    /can't live without/gi,
    /miss you so much/gi,
    /thinking about you constantly/gi,
    /desperate/gi,
    /lonely without you/gi
  ],
  pressure: [
    /please call me/gi,
    /you have to/gi,
    /need to talk/gi,
    /we need to discuss/gi,
    /answer me/gi,
    /respond to me/gi,
    /ignoring me/gi
  ],
  ultimatums: [
    /if you don't/gi,
    /last chance/gi,
    /or else/gi,
    /final time/gi,
    /it's over if/gi,
    /choose between/gi
  ],
  jealousy: [
    /with someone else/gi,
    /other guys?/gi,
    /seeing anyone/gi,
    /who are you with/gi,
    /dating someone/gi
  ],
  begging: [
    /please please/gi,
    /i'm begging/gi,
    /please give me/gi,
    /just one chance/gi,
    /i'll do anything/gi
  ],
  manipulation: [
    /you owe me/gi,
    /after everything/gi,
    /how could you/gi,
    /you're being cruel/gi,
    /you're hurting me/gi
  ]
};

const SAFE_ALTERNATIVES = [
  "Hey, hope you're having a great week",
  "Just wanted to say hi and see how things are going",
  "Thought of you today - hope all is well",
  "Had a good day today and wanted to share the positive energy",
  "Hope your [day/week] is going smoothly",
  "Just checking in - hope you're doing well",
  "Saw something today that made me smile and think of you",
  "Hope you're taking care of yourself"
];

const CURIOSITY_ALTERNATIVES = [
  "How did that [project] you mentioned turn out?",
  "Did you end up trying that [place] we talked about?",
  "Just curious - how's [thing they mentioned] going?",
  "Remembered our conversation about [topic] - how's that developing?",
  "Been wondering how your [goal/project] is progressing"
];

function analyzeText(text: string): TextAnalysis {
  const issues: string[] = [];
  let riskScore = 0;

  // Check each pattern category
  Object.entries(RISKY_PATTERNS).forEach(([category, patterns]) => {
    const hasIssue = patterns.some(pattern => pattern.test(text));
    if (hasIssue) {
      issues.push(category);
      riskScore += category === 'neediness' ? 3 : 
                   category === 'ultimatums' ? 4 :
                   category === 'manipulation' ? 4 : 2;
    }
  });

  // Length penalty for very long texts (desperation indicator)
  if (text.length > 300) {
    riskScore += 2;
    issues.push("excessive_length");
  }

  // Multiple question marks (desperation/pressure)
  const questionMarks = (text.match(/\?/g) || []).length;
  if (questionMarks >= 3) {
    riskScore += 1;
    issues.push("excessive_questions");
  }

  // All caps words (emotional/aggressive)
  const capsWords = text.match(/\b[A-Z]{3,}\b/g);
  if (capsWords && capsWords.length > 2) {
    riskScore += 1;
    issues.push("excessive_caps");
  }

  return {
    hasNeediness: issues.includes('neediness'),
    hasPressure: issues.includes('pressure'),
    hasUltimatums: issues.includes('ultimatums'),
    hasJealousy: issues.includes('jealousy'),
    hasBegging: issues.includes('begging'),
    hasManipulation: issues.includes('manipulation'),
    score: Math.min(10, riskScore) // Cap at 10
  };
}

function generateSafeRewrite(originalText: string, analysis: TextAnalysis): string {
  // If score is very low (0-2), just clean up slightly
  if (analysis.score <= 2) {
    return originalText
      .replace(/please reply/gi, "")
      .replace(/need you/gi, "thinking of you")
      .trim();
  }

  // For high-risk texts, use safe alternatives
  if (analysis.score >= 6) {
    const alternatives = Math.random() > 0.5 ? SAFE_ALTERNATIVES : CURIOSITY_ALTERNATIVES;
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  // Medium risk - selective replacement
  let rewritten = originalText;
  
  // Remove neediness
  if (analysis.hasNeediness) {
    rewritten = rewritten
      .replace(/please reply.*/gi, "")
      .replace(/can't live without you/gi, "value our connection")
      .replace(/miss you so much/gi, "been thinking of you")
      .replace(/need you/gi, "appreciate you");
  }

  // Remove pressure
  if (analysis.hasPressure) {
    rewritten = rewritten
      .replace(/please call me/gi, "would love to catch up sometime")
      .replace(/need to talk/gi, "would be nice to chat")
      .replace(/answer me/gi, "");
  }

  // Remove ultimatums completely
  if (analysis.hasUltimatums) {
    return SAFE_ALTERNATIVES[Math.floor(Math.random() * SAFE_ALTERNATIVES.length)];
  }

  return rewritten.trim() || SAFE_ALTERNATIVES[0];
}

export function rewriteSafeText(request: SafeTextRequest): SafeTextResponse {
  const analysis = analyzeText(request.text);
  const rewritten = generateSafeRewrite(request.text, analysis);
  
  // Generate alternatives
  const alternatives: string[] = [];
  for (let i = 0; i < 2; i++) {
    const altList = Math.random() > 0.5 ? SAFE_ALTERNATIVES : CURIOSITY_ALTERNATIVES;
    const alt = altList[Math.floor(Math.random() * altList.length)];
    if (!alternatives.includes(alt) && alt !== rewritten) {
      alternatives.push(alt);
    }
  }

  // Generate notes based on issues found
  const notes: string[] = [];
  if (analysis.hasNeediness) notes.push("removed needy language");
  if (analysis.hasPressure) notes.push("eliminated pressure");
  if (analysis.hasUltimatums) notes.push("removed ultimatums");
  if (analysis.score <= 2) notes.push("text was already quite safe");
  if (notes.length === 0) notes.push("keep it light and positive");

  // Map internal analysis to external issues
  const issues: string[] = [];
  if (analysis.hasNeediness) issues.push("neediness");
  if (analysis.hasPressure) issues.push("pressure");
  if (analysis.hasUltimatums) issues.push("ultimatums");
  if (analysis.hasJealousy) issues.push("jealousy");
  if (analysis.hasBegging) issues.push("begging");
  if (analysis.hasManipulation) issues.push("manipulation");

  return {
    score: Math.max(0, 10 - analysis.score), // Invert score so higher is better
    issues,
    rewritten,
    alternatives,
    notes
  };
}
