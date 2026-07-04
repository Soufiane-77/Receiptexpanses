/**
 * Classifies where a visit came from, with first-class detection of AI answer
 * engines (ChatGPT, Claude, Perplexity, Gemini, Copilot, etc.) so AI-referred
 * traffic is visible in analytics. Pure + dependency-free so it is unit-testable
 * and usable on both the edge (API route) and, if needed, the client.
 */

export type ReferrerSource = {
  /** Stable machine key, e.g. "chatgpt", "perplexity", "google", "direct". */
  source: string;
  /** Human label for dashboards, e.g. "ChatGPT". */
  label: string;
  /** True when this is an AI answer engine / assistant referral. */
  isAI: boolean;
  /** "ai" | "search" | "social" | "referral" | "direct". */
  medium: "ai" | "search" | "social" | "referral" | "direct";
};

/** Host substrings → AI engine. Ordered by specificity. */
const AI_HOSTS: { match: string; source: string; label: string }[] = [
  { match: "chatgpt.com", source: "chatgpt", label: "ChatGPT" },
  { match: "chat.openai.com", source: "chatgpt", label: "ChatGPT" },
  { match: "openai.com", source: "openai", label: "OpenAI" },
  { match: "claude.ai", source: "claude", label: "Claude" },
  { match: "anthropic.com", source: "claude", label: "Claude" },
  { match: "perplexity.ai", source: "perplexity", label: "Perplexity" },
  { match: "gemini.google.com", source: "gemini", label: "Gemini" },
  { match: "bard.google.com", source: "gemini", label: "Gemini" },
  { match: "copilot.microsoft.com", source: "copilot", label: "Microsoft Copilot" },
  { match: "bing.com/chat", source: "copilot", label: "Microsoft Copilot" },
  { match: "you.com", source: "you", label: "You.com" },
  { match: "poe.com", source: "poe", label: "Poe" },
  { match: "phind.com", source: "phind", label: "Phind" },
  { match: "duckduckgo.com/aichat", source: "duckassist", label: "DuckDuckGo AI" },
  { match: "grok.com", source: "grok", label: "Grok" },
  { match: "x.ai", source: "grok", label: "Grok" },
  { match: "mistral.ai", source: "mistral", label: "Mistral" },
];

/** utm_source / ?ref values answer engines sometimes append. */
const AI_UTM: { match: string; source: string; label: string }[] = [
  { match: "chatgpt", source: "chatgpt", label: "ChatGPT" },
  { match: "openai", source: "chatgpt", label: "ChatGPT" },
  { match: "claude", source: "claude", label: "Claude" },
  { match: "perplexity", source: "perplexity", label: "Perplexity" },
  { match: "gemini", source: "gemini", label: "Gemini" },
  { match: "copilot", source: "copilot", label: "Microsoft Copilot" },
  { match: "bing_chat", source: "copilot", label: "Microsoft Copilot" },
];

const SEARCH_HOSTS: { match: string; source: string; label: string }[] = [
  { match: "google.", source: "google", label: "Google" },
  { match: "bing.com", source: "bing", label: "Bing" },
  { match: "duckduckgo.com", source: "duckduckgo", label: "DuckDuckGo" },
  { match: "yahoo.com", source: "yahoo", label: "Yahoo" },
  { match: "yandex.", source: "yandex", label: "Yandex" },
  { match: "ecosia.org", source: "ecosia", label: "Ecosia" },
  { match: "brave.com", source: "brave", label: "Brave" },
];

const SOCIAL_HOSTS: { match: string; source: string; label: string }[] = [
  { match: "reddit.com", source: "reddit", label: "Reddit" },
  { match: "twitter.com", source: "twitter", label: "X / Twitter" },
  { match: "t.co", source: "twitter", label: "X / Twitter" },
  { match: "facebook.com", source: "facebook", label: "Facebook" },
  { match: "linkedin.com", source: "linkedin", label: "LinkedIn" },
  { match: "youtube.com", source: "youtube", label: "YouTube" },
  { match: "instagram.com", source: "instagram", label: "Instagram" },
  { match: "tiktok.com", source: "tiktok", label: "TikTok" },
];

function hostFrom(referrer: string): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Classify a visit from its `document.referrer` and the landing URL's query
 * params (utm_source / ref). utm/ref win over host so an engine that both links
 * and tags is still credited correctly.
 */
export function classifyReferrer(referrer: string, params?: URLSearchParams): ReferrerSource {
  const utm = (params?.get("utm_source") ?? params?.get("ref") ?? "").toLowerCase();
  if (utm) {
    const ai = AI_UTM.find((u) => utm.includes(u.match));
    if (ai) return { source: ai.source, label: ai.label, isAI: true, medium: "ai" };
  }

  const host = hostFrom(referrer);
  if (!host) {
    // No referrer + a tagged utm still tells us something; otherwise it's direct.
    if (utm) return { source: utm, label: utm, isAI: false, medium: "referral" };
    return { source: "direct", label: "Direct", isAI: false, medium: "direct" };
  }

  const path = safePath(referrer);
  const full = host + path;

  const ai = AI_HOSTS.find((h) => full.includes(h.match) || host.includes(h.match));
  if (ai) return { source: ai.source, label: ai.label, isAI: true, medium: "ai" };

  const search = SEARCH_HOSTS.find((h) => host.includes(h.match));
  if (search) return { source: search.source, label: search.label, isAI: false, medium: "search" };

  const social = SOCIAL_HOSTS.find((h) => host.includes(h.match));
  if (social) return { source: social.source, label: social.label, isAI: false, medium: "social" };

  return { source: host, label: host, isAI: false, medium: "referral" };
}

function safePath(referrer: string): string {
  try {
    return new URL(referrer).pathname.toLowerCase();
  } catch {
    return "";
  }
}
