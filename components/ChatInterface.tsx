"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import FeedbackPrompt from "./FeedbackPrompt";

type DetectedLanguage = "bn" | "en";

interface Citation {
  label: string;
  sourceUrl: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  /** True only for the static local greeting, never sent to the API as history. */
  isGreeting?: boolean;
}

interface ChatApiResponse {
  reply?: string;
  detectedLanguage?: DetectedLanguage;
  citations?: Citation[];
  error?: string;
}

interface ChatInterfaceProps {
  /** Optional example questions rendered as clickable chips above the input. */
  exampleQuestions?: string[];
}

// ---------------------------------------------------------------------------
// Minimal Web Speech API types. Not part of TypeScript's default DOM lib, and
// not standardised across browsers, so this is a narrow local shape covering
// only what the mic button below actually touches, rather than a new
// @types dependency for one feature. Unsupported browsers simply never see
// SpeechRecognition/webkitSpeechRecognition on window, which the feature
// check below treats as "no voice input available" rather than an error.
// ---------------------------------------------------------------------------
interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    [index: number]: { [index: number]: SpeechRecognitionResultLike; isFinal: boolean };
  };
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

const GREETING =
  "Welcome! Ask me anything about artificial intelligence. / স্বাগতম! কৃত্রিম বুদ্ধিমত্তা (AI) নিয়ে যেকোনো প্রশ্ন করুন।";

const FETCH_ERROR_REPLY =
  "Sorry, I couldn't reach AI Janala just now. Please check your connection and try again. / দুঃখিত, এই মুহূর্তে AI জানালার সাথে সংযোগ করা যায়নি। অনুগ্রহ করে আপনার সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।";

// A broad bank of next-question suggestions shown after a real reply, so a
// visitor who does not know what else to ask can keep going deeper rather
// than stopping at one exchange. Deliberately spans topics the RAG corpus
// and the base model both cover well, not just the seeded example questions.
const FOLLOW_UP_QUESTIONS = [
  "What is machine learning?",
  "মেশিন লার্নিং কী?",
  "Is AI going to take my job?",
  "চাকরির উপর AI-এর প্রভাব কী?",
  "What does Bangladesh's AI policy say?",
  "বাংলাদেশের AI নীতিতে কী আছে?",
  "How do I know if something online is made by AI?",
  "কীভাবে বুঝব কোনো কিছু AI দিয়ে তৈরি?",
  "What is Digital Bangladesh?",
  "ডিজিটাল বাংলাদেশ কী?",
  "Can AI give wrong or biased answers?",
  "AI কি ভুল বা পক্ষপাতমূলক তথ্য দিতে পারে?",
  "What is generative AI?",
  "জেনারেটিভ AI কী?",
];

// Kept modest so the request payload stays small; the server independently
// caps history too, so this is just about not sending more than needed.
const MAX_HISTORY_MESSAGES = 6;

let messageIdCounter = 0;
function nextId(): string {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

function BotAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-brand-green-light text-base"
    >
      🤖
    </span>
  );
}

export default function ChatInterface({
  exampleQuestions = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: "assistant", text: GREETING, isGreeting: true },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastDetectedLanguage, setLastDetectedLanguage] =
    useState<DetectedLanguage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // The visitor has completed a real exchange once at least one non-greeting
  // assistant reply has landed - that is the moment to offer the feedback
  // survey, not before, and not on every single message after.
  const hasCompletedFirstExchange = messages.some(
    (message) => message.role === "assistant" && !message.isGreeting
  );

  const lastMessage = messages[messages.length - 1];
  const showFollowUps =
    !isLoading &&
    Boolean(lastMessage) &&
    lastMessage.role === "assistant" &&
    !lastMessage.isGreeting;

  // Recomputed only when the latest message actually changes (via the id in
  // the dependency array), not on every keystroke re-render, so the chips
  // stay put while the visitor is typing a reply to them.
  const followUpQuestions = useMemo(() => {
    if (!showFollowUps) return [];
    const justAsked = messages
      .filter((message) => message.role === "user")
      .slice(-1)[0]
      ?.text.trim()
      .toLowerCase();
    const pool = FOLLOW_UP_QUESTIONS.filter(
      (question) => question.trim().toLowerCase() !== justAsked
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage?.id, showFollowUps]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Feature-detect the Web Speech API once on mount. Only Chromium-based
  // browsers support it today, so the mic button below simply never renders
  // anywhere else rather than rendering broken.
  useEffect(() => {
    const w = window as unknown as WindowWithSpeechRecognition;
    setVoiceSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || isLoading) return;

    // Snapshot conversation history (excluding the static greeting) before
    // adding this new turn, so the model can follow up on earlier context.
    const history = messages
      .filter((message) => !message.isGreeting)
      .slice(-MAX_HISTORY_MESSAGES)
      .map((message) => ({ role: message.role, content: message.text }));

    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!response.ok) {
        throw new Error(`Chat API responded with status ${response.status}`);
      }

      const data: ChatApiResponse = await response.json();
      const replyText =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : FETCH_ERROR_REPLY;
      const citations = Array.isArray(data.citations)
        ? data.citations
        : undefined;

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", text: replyText, citations },
      ]);

      if (data.detectedLanguage === "bn" || data.detectedLanguage === "en") {
        setLastDetectedLanguage(data.detectedLanguage);
      }
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", text: FETCH_ERROR_REPLY },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  // Minimal voice input: fills the text box from speech so the visitor can
  // still edit or add to it before sending, rather than auto-sending on
  // recognition (recognition can mishear, and this keeps a human in the
  // loop). Defaults to whichever language the conversation last used, since
  // that is a better guess than a fixed language for a bilingual product.
  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const w = window as unknown as WindowWithSpeechRecognition;
    const RecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.lang = lastDetectedLanguage === "en" ? "en-US" : "bn-BD";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i]?.[0]?.transcript ?? "";
      }
      setInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {exampleQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50 p-3 sm:p-4">
          {exampleQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => setInput(question)}
              className="rounded-full border border-brand-green/30 bg-white px-3 py-1.5 text-xs font-medium text-brand-green transition-colors hover:bg-brand-green-light active:bg-brand-green-light sm:text-sm"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex h-80 flex-col gap-3 overflow-y-auto p-4 sm:h-96 sm:p-6"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {message.role === "assistant" && <BotAvatar />}
            <div
              className={`flex max-w-[80%] flex-col gap-1.5 ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed sm:text-base ${
                  message.role === "user"
                    ? "rounded-br-sm bg-brand-green text-white"
                    : "rounded-bl-sm bg-gray-100 text-gray-800"
                }`}
              >
                {message.text}
              </div>

              {message.citations && message.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pl-1">
                  <span className="text-[11px] font-medium text-gray-400">
                    Grounded in:
                  </span>
                  {message.citations.map((citation) => (
                    <a
                      key={citation.sourceUrl + citation.label}
                      href={citation.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-brand-green/30 bg-brand-green-light px-2.5 py-1 text-[11px] font-medium text-brand-green-dark hover:underline"
                    >
                      {citation.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-2">
            <BotAvatar />
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2 text-sm text-gray-500">
              <span className="animate-pulse">AI Janala is typing…</span>
            </div>
          </div>
        )}

        {followUpQuestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pl-10">
            <span className="w-full text-[11px] font-medium text-gray-400">
              Continue exploring:
            </span>
            {followUpQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void sendMessage(question)}
                className="rounded-full border border-brand-green/30 bg-white px-3 py-1.5 text-xs font-medium text-brand-green transition-colors hover:bg-brand-green-light active:bg-brand-green-light"
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>

      <FeedbackPrompt show={hasCompletedFirstExchange} />

      <div className="min-h-[2.25rem] border-t border-gray-100 px-4 py-2 sm:px-6">
        {lastDetectedLanguage && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-light px-2.5 py-1 text-xs font-medium text-brand-green-dark">
            Detected: {lastDetectedLanguage === "bn" ? "বাংলা" : "English"}
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-100 p-3 sm:p-4"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about AI... / AI সম্পর্কে জিজ্ঞাসা করুন..."
          aria-label="Ask about AI / AI সম্পর্কে জিজ্ঞাসা করুন"
          className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm text-gray-800 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green sm:text-base"
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleListening}
            aria-label={
              isListening
                ? "Stop voice input / ভয়েস ইনপুট বন্ধ করুন"
                : "Start voice input / ভয়েস ইনপুট শুরু করুন"
            }
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg transition-colors ${
              isListening
                ? "animate-pulse border-red-300 bg-red-50 text-red-600"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {isListening ? "⏺" : "🎤"}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand-green px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:text-base"
        >
          Send
        </button>
      </form>
    </div>
  );
}
