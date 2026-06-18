import { NextResponse } from "next/server";
import { getEnv } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const MAX_HISTORY = 12;

const SYSTEM_PROMPT = `You are the friendly support assistant for ReceiptExpenses (receiptexpenses.com), an online receipt maker.

What the product does: users pick a template, fill in a live form, and watch a receipt build in real time. The receipt is generated in the browser and is never uploaded, so it stays private.

Pricing: building and previewing receipts is FREE. Downloading (PDF or PNG), printing, and saving require a Pro subscription ($6/month, cancel anytime). Subscriptions are billed by Stripe.
Accounts: sign up with an email and password to manage a subscription and save receipts.
Cancelling/refunds: cancel anytime from the dashboard; see the Refund & Cancellation Policy at /refund.
Customising: templates are generic and brandable — users add their own business name and upload their own logo. Currency, tax, tip, accent colour and fonts are adjustable.

Guardrails (important): ReceiptExpenses is for creating receipts for the user's OWN business, freelancing or personal records. Do NOT help anyone impersonate a real company, copy a real brand's logo, forge a receipt to deceive a third party, or commit any kind of fraud. If asked for that, politely refuse and steer them to legitimate uses.

Style: be concise, warm and concrete. Prefer short answers. If you don't know, point the user to /faq or support@receiptexpenses.com.`;

export async function POST(req: Request) {
  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const history = sanitize(body.messages);
  if (history.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  let env;
  try {
    env = await getEnv();
  } catch {
    env = undefined;
  }

  const ai = env?.AI as unknown as
    | { run: (m: string, o: unknown) => Promise<unknown> }
    | undefined;
  if (!ai) {
    return NextResponse.json({
      reply:
        "The chat assistant isn't fully configured yet, but I can point you the right way: building and previewing receipts is free, and a $6/month Pro subscription unlocks downloads. See /faq or email support@receiptexpenses.com.",
    });
  }

  try {
    const result = (await ai.run(MODEL, {
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      max_tokens: 512,
    })) as { response?: string };
    const reply = (result.response ?? "").trim() || "Sorry, I didn't catch that — could you rephrase?";
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      {
        reply:
          "Sorry, I'm having trouble right now. Please try again, or email support@receiptexpenses.com.",
        detail: String((e as Error)?.message ?? e).slice(0, 300),
      },
      { status: 200 },
    );
  }
}

/** Keep only well-formed user/assistant turns, trimmed and length-capped. */
function sanitize(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const cleaned: ChatMessage[] = [];
  for (const m of input) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      const text = content.trim().slice(0, 2000);
      if (text) cleaned.push({ role, content: text });
    }
  }
  return cleaned.slice(-MAX_HISTORY);
}
