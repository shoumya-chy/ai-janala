import { NextRequest, NextResponse } from "next/server";
import { retrieve, buildGroundingContext } from "@/lib/retrieval";

export const runtime = "nodejs";

type DetectedLanguage = "bn" | "en";
type ChatRole = "user" | "assistant";

interface ChatTurn {
  role: ChatRole;
  content: string;
}

interface Citation {
  label: string;
  sourceUrl: string;
}

interface ChatResponseBody {
  reply: string;
  detectedLanguage: DetectedLanguage;
  citations?: Citation[];
}

// Unicode range for the Bengali script block (U+0980–U+09FF).
const BENGALI_BLOCK_REGEX = /[ঀ-৿]/;

// Everything below is free to run: in-process caps, an in-memory sliding
// window, and a small in-memory cache. No paid service, no new dependency.
const MAX_MESSAGE_LENGTH = 600;
const MAX_HISTORY_TURNS = 6; // most recent turns only, oldest dropped first
const MAX_HISTORY_TURN_LENGTH = 600;

const SYSTEM_PROMPT = `You are an AI literacy assistant called "AI Janala" designed to explain artificial intelligence concepts to people with no technical background. Your users are Bengali and English speakers in Bangladesh and South Asia who want to understand AI in simple terms.

Rules:
1. Always respond in the same language the user writes in. If they write in Bengali, respond in Bengali. If they write in English, respond in English.
2. Never use technical jargon without immediately explaining it in simple words.
3. Use analogies and examples from everyday South Asian life that your users will recognise, such as rickshaws, bazaars, mobile banking, rice farming, government offices.
4. Keep responses concise, between 3 to 6 sentences maximum.
5. Be warm, friendly, and encouraging. Never make the user feel stupid for asking basic questions.
6. If asked about something unrelated to AI and no reference material has been provided to you for this question, gently redirect: "I am here to help you understand AI. Could you ask me something about artificial intelligence?" If reference material IS provided below, it was deliberately retrieved from AI Janala's reference library on AI, machine learning, and Bangladesh's ICT and AI-related policy, so use it to answer even if the question's surface wording is broader than AI on its face (for example, a question about Bangladesh's digital commerce or ICT policy).
7. For Bengali responses, use standard literary Bengali (Shudho Bangla) that is widely understood across Bangladesh and West Bengal.
8. Never open a reply with a religious greeting or blessing, in any language (for example, do not use "নমস্কার", "আসসালামু আলাইকুম", "Namaskar", "Assalamu Alaikum", "Khoda Hafez", or similar). Simply begin answering the question directly, without any greeting word.
9. Stay religion-neutral and politically neutral at all times: do not reference specific religions, religious festivals, political parties, politicians, or divisive political topics, even in passing or as an analogy. Your language should feel equally natural to a user of any faith, ethnicity, or political affiliation.
10. Never use an em dash (—) in English or Bengali replies. Use a comma, period, or colon instead.
11. Use the conversation history only to understand what "it", "that", or a follow-up question refers to. Treat each turn's factual content on its own merits and do not assume earlier turns were correct.`;

const NOT_CONFIGURED_MESSAGE =
  "The AI backend isn't connected yet, so I can't answer that just now. Please check back soon! / এই মুহূর্তে AI ব্যাকএন্ড যুক্ত করা হয়নি, তাই আমি এখনই উত্তর দিতে পারছি না। অনুগ্রহ করে শীঘ্রই আবার চেষ্টা করুন!";

const ERROR_MESSAGE =
  "Sorry, I ran into a problem reaching the AI just now. Please try again in a moment. / দুঃখিত, এই মুহূর্তে AI-এর সাথে যোগাযোগ করতে একটি সমস্যা হয়েছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।";

const RATE_LIMITED_MESSAGE =
  "You're sending messages a little too quickly. Please wait a few seconds and try again. / আপনি একটু দ্রুত বার্তা পাঠাচ্ছেন। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।";

const MESSAGE_TOO_LONG_MESSAGE =
  "That message is a bit too long for me to answer well. Could you shorten it to one focused question? / বার্তাটি একটু বেশি লম্বা হয়ে গেছে। অনুগ্রহ করে এটিকে একটি সংক্ষিপ্ত প্রশ্নে ভেঙে জিজ্ঞাসা করুন।";

function detectLanguage(message: string): DetectedLanguage {
  return BENGALI_BLOCK_REGEX.test(message) ? "bn" : "en";
}

function jsonResponse(body: ChatResponseBody, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per server instance, zero cost)
//
// Vercel's Node.js functions can stay warm and serve several requests from
// the same in-memory Map, so this genuinely throttles a client hammering the
// endpoint within a warm instance. It is NOT a global, cross-instance limit
// (that would need a paid store like Upstash/Vercel KV) and it resets on
// cold start or redeploy. That is an acceptable, honest trade-off for a free
// demo: it blunts casual abuse of the free Gemini quota without costing
// anything or adding a new service.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const rateLimitLog = new Map<string, number[]>();

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const recent = (rateLimitLog.get(clientId) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  rateLimitLog.set(clientId, recent);

  // Keep the map from growing without bound over a long-lived warm instance.
  // (Array.from rather than a bare for-of: this project's TS target doesn't
  // have downlevelIteration enabled for Map iterators.)
  if (rateLimitLog.size > 5000) {
    for (const [key, timestamps] of Array.from(rateLimitLog.entries())) {
      if (timestamps.every((t) => now - t > RATE_LIMIT_WINDOW_MS)) {
        rateLimitLog.delete(key);
      }
    }
  }

  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientId(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// ---------------------------------------------------------------------------
// Response cache (in-memory, zero cost)
//
// Only used for the opening question of a conversation (no history yet),
// so a cached reply can never be wrong for a follow-up that depends on
// context. This mainly helps the common case of many first-time visitors
// asking the same handful of "what is AI" style questions: it saves a full
// model call (faster reply, less free-quota usage) for repeats within the
// window.
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 30 * 60_000;
const CACHE_MAX_ENTRIES = 200;

interface CacheEntry {
  reply: string;
  citations: Citation[];
  detectedLanguage: DetectedLanguage;
  cachedAt: number;
}

const responseCache = new Map<string, CacheEntry>();

function cacheKey(message: string, language: DetectedLanguage): string {
  return `${language}::${message.toLowerCase().trim().replace(/\s+/g, " ")}`;
}

function getCached(key: string): CacheEntry | undefined {
  const entry = responseCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    responseCache.delete(key);
    return undefined;
  }
  return entry;
}

function setCached(key: string, entry: CacheEntry): void {
  if (responseCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey !== undefined) responseCache.delete(oldestKey);
  }
  responseCache.set(key, entry);
}

// ---------------------------------------------------------------------------
// Conversation history validation
// ---------------------------------------------------------------------------
function sanitiseHistory(input: unknown): ChatTurn[] {
  if (!Array.isArray(input)) return [];

  const turns: ChatTurn[] = [];
  for (const item of input) {
    if (
      item &&
      typeof item === "object" &&
      (item as { role?: unknown }).role !== undefined &&
      ((item as { role?: unknown }).role === "user" ||
        (item as { role?: unknown }).role === "assistant") &&
      typeof (item as { content?: unknown }).content === "string" &&
      (item as { content: string }).content.trim()
    ) {
      const role = (item as { role: ChatRole }).role;
      const content = (item as { content: string }).content
        .trim()
        .slice(0, MAX_HISTORY_TURN_LENGTH);
      turns.push({ role, content });
    }
  }

  return turns.slice(-MAX_HISTORY_TURNS);
}

// ---------------------------------------------------------------------------
// Provider calls
//
// Both throw a ProviderError instead of catching internally, so the caller
// can decide whether to retry (transient: network failure or 5xx) or move
// straight to the other provider (permanent: bad request, auth, 429).
// ---------------------------------------------------------------------------
interface ProviderError extends Error {
  status?: number;
  retryable: boolean;
}

function providerError(message: string, status?: number): ProviderError {
  const error = new Error(message) as ProviderError;
  error.status = status;
  // No status at all means the fetch itself failed (network blip): worth a
  // retry. A 5xx means the provider had a transient problem: worth a retry.
  // A 4xx (bad request, auth, rate limit) will not succeed on retry.
  error.retryable = status === undefined || status >= 500;
  return error;
}

async function callGroq(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });
  } catch (networkError) {
    throw providerError(`Groq network error: ${String(networkError)}`);
  }

  if (!response.ok) {
    throw providerError(`Groq API responded with status ${response.status}`, response.status);
  }

  const data = await response.json();
  const reply: unknown = data?.choices?.[0]?.message?.content;

  if (typeof reply !== "string" || !reply.trim()) {
    throw providerError("Groq API returned an empty reply.");
  }

  return reply.trim();
}

// Model choice matters here, not just for cost: the non-"lite" 3.x Gemini
// Flash models "think" (extended hidden reasoning) by default and there is
// no reliable way to fully disable it via thinkingConfig on this generation
// (thinkingBudget: 0 is rejected; low budgets are treated as a soft hint,
// not a cap). That hidden reasoning eats the SAME maxOutputTokens budget as
// the visible reply, so replies were getting cut off mid-sentence at ~500
// tokens, and raising the cap enough to avoid that pushed real requests to
// 60-70+ seconds, unacceptable for a chat UI, especially on the slow
// mobile connections this project is designed for. gemini-3.5-flash-lite
// does not do this extended thinking, answers in ~1-2 seconds, and tested
// with equal or better quality on both English and Bengali prompts. If you
// ever "upgrade" this to a non-lite model, retest latency before shipping.
async function callGemini(
  contents: { role: "user" | "model"; parts: { text: string }[] }[],
  systemInstruction: string,
  apiKey: string
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    );
  } catch (networkError) {
    throw providerError(`Gemini network error: ${String(networkError)}`);
  }

  if (!response.ok) {
    throw providerError(`Gemini API responded with status ${response.status}`, response.status);
  }

  const data = await response.json();
  const reply: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof reply !== "string" || !reply.trim()) {
    throw providerError("Gemini API returned an empty reply.");
  }

  return reply.trim();
}

/**
 * Tries each configured provider in turn (Groq first, then Gemini, matching
 * the previous behaviour when both happen to be configured). Within a
 * provider, retries once on a transient failure before giving up on that
 * provider and moving to the next one. Throws the last error if every
 * configured provider fails.
 */
async function generateReply(
  systemPrompt: string,
  history: ChatTurn[],
  message: string,
  groqApiKey: string | undefined,
  geminiApiKey: string | undefined
): Promise<string> {
  const attempts: Array<() => Promise<string>> = [];

  if (groqApiKey) {
    attempts.push(() =>
      callGroq(
        [
          { role: "system", content: systemPrompt },
          ...history.map((turn) => ({ role: turn.role, content: turn.content })),
          { role: "user", content: message },
        ],
        groqApiKey
      )
    );
  }

  if (geminiApiKey) {
    attempts.push(() =>
      callGemini(
        [
          ...history.map((turn) => ({
            role: (turn.role === "user" ? "user" : "model") as "user" | "model",
            parts: [{ text: turn.content }],
          })),
          { role: "user" as const, parts: [{ text: message }] },
        ],
        systemPrompt,
        geminiApiKey
      )
    );
  }

  let lastError: unknown;

  for (const callProvider of attempts) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callProvider();
      } catch (error) {
        lastError = error;
        console.error("[api/chat] provider attempt failed:", error);
        const retryable = (error as ProviderError)?.retryable;
        if (!retryable) break; // permanent failure: skip straight to next provider
      }
    }
  }

  throw lastError ?? new Error("No AI provider is configured.");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientId = getClientId(request);
  if (isRateLimited(clientId)) {
    return jsonResponse({ reply: RATE_LIMITED_MESSAGE, detectedLanguage: "en" });
  }

  let message: string | undefined;
  let historyInput: unknown;

  try {
    const body = await request.json();
    if (typeof body?.message === "string") {
      message = body.message;
    }
    historyInput = body?.history;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON shaped like { message: string }." },
      { status: 400 }
    );
  }

  if (!message || !message.trim()) {
    return NextResponse.json(
      { error: "Please provide a non-empty 'message' string." },
      { status: 400 }
    );
  }

  const trimmedMessage = message.trim();
  const detectedLanguage = detectLanguage(trimmedMessage);

  // Real-usage log (TRL evidence): a timestamped, truncated record of actual
  // questions asked in production, separate from the survey campaign. No
  // names or client IDs are logged, only a short preview, language, and
  // length. This flows into Vercel's own function logs at zero extra cost
  // and no new infrastructure, viewable via the dashboard or `vercel logs`.
  console.log(
    JSON.stringify({
      event: "chat_message",
      timestamp: new Date().toISOString(),
      language: detectedLanguage,
      messageLength: trimmedMessage.length,
      messagePreview: trimmedMessage.slice(0, 120),
      historyTurns: sanitiseHistory(historyInput).length,
    })
  );

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ reply: MESSAGE_TOO_LONG_MESSAGE, detectedLanguage });
  }

  const history = sanitiseHistory(historyInput);

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!groqApiKey && !geminiApiKey) {
    return jsonResponse({ reply: NOT_CONFIGURED_MESSAGE, detectedLanguage });
  }

  // Only serve/populate the cache for the opening turn of a conversation, so
  // a cached answer can never ignore context a follow-up question depends on.
  const isFreshConversation = history.length === 0;
  const key = cacheKey(trimmedMessage, detectedLanguage);

  if (isFreshConversation) {
    const cached = getCached(key);
    if (cached) {
      return jsonResponse({
        reply: cached.reply,
        detectedLanguage: cached.detectedLanguage,
        ...(cached.citations.length > 0 ? { citations: cached.citations } : {}),
      });
    }
  }

  const retrievedChunks = retrieve(trimmedMessage);
  const { contextBlock, citations } = buildGroundingContext(retrievedChunks);
  const effectiveSystemPrompt = contextBlock
    ? `${SYSTEM_PROMPT}\n\n${contextBlock}`
    : SYSTEM_PROMPT;

  try {
    const reply = await generateReply(
      effectiveSystemPrompt,
      history,
      trimmedMessage,
      groqApiKey,
      geminiApiKey
    );

    if (isFreshConversation) {
      setCached(key, { reply, citations, detectedLanguage, cachedAt: Date.now() });
    }

    return jsonResponse({
      reply,
      detectedLanguage,
      ...(citations.length > 0 ? { citations } : {}),
    });
  } catch (error) {
    console.error("[api/chat] all configured providers failed:", error);
    return jsonResponse({ reply: ERROR_MESSAGE, detectedLanguage });
  }
}
