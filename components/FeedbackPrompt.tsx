"use client";

import { useEffect, useState } from "react";

// Set NEXT_PUBLIC_FEEDBACK_SURVEY_URL (in .env.local for dev, and in the
// Vercel project's Environment Variables for production) once the survey
// form exists. Until then this component quietly renders nothing.
const SURVEY_URL = process.env.NEXT_PUBLIC_FEEDBACK_SURVEY_URL ?? "";

const DISMISS_KEY = "ai-janala-feedback-dismissed-at";
const DISMISS_DAYS = 14;

interface FeedbackPromptProps {
  /** Only ever shown once the visitor has completed a real exchange. */
  show: boolean;
}

export default function FeedbackPrompt({ show }: FeedbackPromptProps) {
  // Start dismissed=true so nothing flashes before the localStorage check
  // below resolves on mount.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const storedAt = Number(window.localStorage.getItem(DISMISS_KEY));
      const daysSinceDismiss = (Date.now() - storedAt) / (1000 * 60 * 60 * 24);
      setDismissed(Number.isFinite(storedAt) && storedAt > 0 && daysSinceDismiss < DISMISS_DAYS);
    } catch {
      // Private browsing / storage blocked - just show the prompt.
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Nothing to persist; it will just show again next visit.
    }
  }

  if (!show || dismissed || !SURVEY_URL) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-brand-green-light/50 px-4 py-2.5 text-xs sm:px-6 sm:text-sm">
      <span className="text-gray-700">
        Was this helpful? Tell us in 2 minutes. / এটি কি সহায়ক হয়েছে? ২ মিনিটে আমাদের জানান।
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <a
          href={SURVEY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDismiss}
          className="font-semibold text-brand-green-dark underline underline-offset-2 hover:text-brand-green"
        >
          Give feedback / মতামত দিন
        </a>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss / বন্ধ করুন"
          className="text-gray-400 hover:text-gray-600"
        >
          &times;
        </button>
      </span>
    </div>
  );
}
