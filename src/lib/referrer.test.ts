import { describe, expect, it } from "vitest";
import { classifyReferrer } from "./referrer";

describe("classifyReferrer — AI answer engines", () => {
  it("detects ChatGPT from chatgpt.com and chat.openai.com", () => {
    expect(classifyReferrer("https://chatgpt.com/")).toMatchObject({ source: "chatgpt", isAI: true, medium: "ai" });
    expect(classifyReferrer("https://chat.openai.com/c/abc")).toMatchObject({ source: "chatgpt", isAI: true });
  });

  it("detects Claude, Perplexity, Gemini, Copilot", () => {
    expect(classifyReferrer("https://claude.ai/chat/1")).toMatchObject({ source: "claude", isAI: true });
    expect(classifyReferrer("https://www.perplexity.ai/search?q=x")).toMatchObject({ source: "perplexity", isAI: true });
    expect(classifyReferrer("https://gemini.google.com/app")).toMatchObject({ source: "gemini", isAI: true });
    expect(classifyReferrer("https://copilot.microsoft.com/")).toMatchObject({ source: "copilot", isAI: true });
  });

  it("detects Bing's AI chat path but plain bing.com as search", () => {
    expect(classifyReferrer("https://www.bing.com/chat")).toMatchObject({ isAI: true, source: "copilot" });
    expect(classifyReferrer("https://www.bing.com/search?q=receipt")).toMatchObject({ isAI: false, medium: "search", source: "bing" });
  });

  it("credits utm_source over host and detects AI utm tags", () => {
    const params = new URLSearchParams("utm_source=chatgpt.com");
    expect(classifyReferrer("", params)).toMatchObject({ source: "chatgpt", isAI: true, medium: "ai" });
  });
});

describe("classifyReferrer — search, social, direct", () => {
  it("classifies Google as search, not AI", () => {
    expect(classifyReferrer("https://www.google.com/")).toMatchObject({ source: "google", isAI: false, medium: "search" });
  });

  it("classifies Reddit/X as social", () => {
    expect(classifyReferrer("https://www.reddit.com/r/x")).toMatchObject({ medium: "social", source: "reddit" });
    expect(classifyReferrer("https://t.co/abc")).toMatchObject({ medium: "social", source: "twitter" });
  });

  it("returns direct for empty referrer and no utm", () => {
    expect(classifyReferrer("")).toMatchObject({ source: "direct", medium: "direct", isAI: false });
  });

  it("falls back to the host for unknown referrers", () => {
    expect(classifyReferrer("https://someblog.example.com/post")).toMatchObject({
      source: "someblog.example.com",
      medium: "referral",
      isAI: false,
    });
  });

  it("does not throw on malformed referrer strings", () => {
    expect(() => classifyReferrer("not a url")).not.toThrow();
    expect(classifyReferrer("not a url")).toMatchObject({ source: "direct" });
  });
});
