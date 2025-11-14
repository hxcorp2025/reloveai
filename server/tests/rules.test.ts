import { describe, it, expect } from "vitest";
import { selectDailyAction } from "../lib/rules/dailyAction";
import { rewriteSafeText } from "../lib/rules/safeText";
import { checkGreenlight } from "../lib/rules/greenlight";
import type { DailyActionRequest, SafeTextRequest, GreenlightRequest } from "../../shared/schema";

describe("Daily Action Rules", () => {
  it("should return mission for days 1-7", () => {
    const request: DailyActionRequest = {
      scenario: "hot_cold",
      day_index: 3,
      last_contact_hours: 24,
      last_response_from_her: "neutral",
      emotional_checkin: "calm"
    };

    const result = selectDailyAction(request);
    expect(result.action).toBe("mission");
    expect(result.why).toContain("Early recovery phase");
  });

  it("should return mission when blocked", () => {
    const request: DailyActionRequest = {
      scenario: "blocked",
      day_index: 10,
      last_contact_hours: 48,
      last_response_from_her: "none",
      emotional_checkin: "calm"
    };

    const result = selectDailyAction(request);
    expect(result.action).toBe("mission");
    expect(result.why).toContain("blocked");
  });

  it("should allow message for positive response with adequate time", () => {
    const request: DailyActionRequest = {
      scenario: "hot_cold",
      day_index: 10,
      last_contact_hours: 72,
      last_response_from_her: "positive",
      emotional_checkin: "calm"
    };

    const result = selectDailyAction(request);
    expect(result.action).toBe("message");
  });

  it("should allow message for neutral response with adequate time", () => {
    const request: DailyActionRequest = {
      scenario: "hot_cold",
      day_index: 10,
      last_contact_hours: 48,
      last_response_from_her: "neutral",
      emotional_checkin: "calm"
    };

    const result = selectDailyAction(request);
    expect(result.action).toBe("message");
  });

  it("should return mission when emotional state is not calm", () => {
    const request: DailyActionRequest = {
      scenario: "hot_cold",
      day_index: 10,
      last_contact_hours: 48,
      last_response_from_her: "positive",
      emotional_checkin: "anxious"
    };

    const result = selectDailyAction(request);
    expect(result.action).toBe("mission");
    expect(result.why).toContain("Emotional state not optimal");
  });
});

describe("SafeText Rules", () => {
  it("should identify neediness and pressure", () => {
    const request: SafeTextRequest = {
      text: "I miss you so much, please reply to me, I can't live without you."
    };

    const result = rewriteSafeText(request);
    expect(result.issues).toContain("neediness");
    expect(result.issues).toContain("pressure");
    expect(result.score).toBeLessThan(5);
    expect(result.rewritten).not.toContain("please reply");
    expect(result.rewritten).not.toContain("can't live without you");
  });

  it("should handle safe text with minor modifications", () => {
    const request: SafeTextRequest = {
      text: "Hope you're having a good week"
    };

    const result = rewriteSafeText(request);
    expect(result.score).toBeGreaterThan(7);
    expect(result.issues.length).toBe(0);
  });

  it("should remove ultimatums completely", () => {
    const request: SafeTextRequest = {
      text: "If you don't call me back, it's over between us"
    };

    const result = rewriteSafeText(request);
    expect(result.issues).toContain("ultimatums");
    expect(result.rewritten).not.toContain("if you don't");
    expect(result.score).toBeLessThan(3);
  });
});

describe("Greenlight Rules", () => {
  it("should return red light when blocked", () => {
    const request: GreenlightRequest = {
      scenario: "blocked",
      silence_hours: 72,
      last_response_from_her: "none",
      relapse_today: false,
      emotional_checkin: "calm"
    };

    const result = checkGreenlight(request);
    expect(result.light).toBe("red");
    expect(result.reason).toContain("blocked");
    expect(result.risk_flags).toContain("blocked");
  });

  it("should return red light for relapse today", () => {
    const request: GreenlightRequest = {
      scenario: "hot_cold",
      silence_hours: 72,
      last_response_from_her: "positive",
      relapse_today: true,
      emotional_checkin: "calm"
    };

    const result = checkGreenlight(request);
    expect(result.light).toBe("red");
    expect(result.reason).toContain("relapse");
    expect(result.risk_flags).toContain("relapse");
  });

  it("should return green light for positive response with adequate silence and calm state", () => {
    const request: GreenlightRequest = {
      scenario: "hot_cold",
      silence_hours: 72,
      last_response_from_her: "positive",
      relapse_today: false,
      emotional_checkin: "calm"
    };

    const result = checkGreenlight(request);
    expect(result.light).toBe("green");
    expect(result.reason).toContain("Great timing");
  });

  it("should return red light for insufficient silence time", () => {
    const request: GreenlightRequest = {
      scenario: "hot_cold",
      silence_hours: 12,
      last_response_from_her: "positive",
      relapse_today: false,
      emotional_checkin: "calm"
    };

    const result = checkGreenlight(request);
    expect(result.light).toBe("red");
    expect(result.reason).toContain("Not enough time");
    expect(result.wait_hours).toBe(12);
  });

  it("should return red light for triggered emotional state", () => {
    const request: GreenlightRequest = {
      scenario: "hot_cold",
      silence_hours: 72,
      last_response_from_her: "positive",
      relapse_today: false,
      emotional_checkin: "triggered"
    };

    const result = checkGreenlight(request);
    expect(result.light).toBe("red");
    expect(result.reason).toContain("emotional state");
    expect(result.risk_flags).toContain("emotional_instability");
  });
});
