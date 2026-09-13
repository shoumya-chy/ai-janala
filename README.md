# AI Janala (AI জানালা)

A free, bilingual (Bengali and English) AI-literacy chatbot. A visitor asks
a plain-language question about artificial intelligence, typed or spoken,
in Bengali or English, and gets a short, jargon-free, culturally grounded
answer. Built by Shoumya Chowdhury and Anmita Das (Master of IT (AI),
University of Melbourne).

Live: https://ai-janala.vercel.app (also served at
https://bengali-ai-literacy.vercel.app)

Bengali is the world's 7th most spoken language (roughly 230 million
speakers) and has essentially zero dedicated AI-literacy tools, despite AI
already being deployed across Bangladesh's government, banking, and
education sectors. AI Janala exists to close that specific gap.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- `next/font/google`: Inter (English) and Noto Sans Bengali (Bengali)
- Recharts (evidence page charts)
- One API route (`app/api/chat/route.ts`) that proxies to Groq or Gemini
  (`gemini-3.5-flash-lite`, chosen specifically for low latency)
- A free, dependency-free keyword-based RAG layer (`lib/retrieval.ts`)
  grounding answers in Bengali Wikipedia's AI/ML articles and Bangladesh's
  public ICT and AI policy documents (`lib/knowledge/*.json`)

No database, no auth, no third-party analytics platform. This is
deliberately a thin, cheap, fast application, and that simplicity is a
feature, not a gap to be filled reflexively.

## Pages

- `/` — homepage: live chat demo first, then a real-usage proof strip,
  hero, problem/solution sections
- `/about` — team bios and publications
- `/evidence` — charts and a downloadable CSV from a real 500-response
  field survey across 10 Bangladeshi districts (TRL6+ validation evidence)

## Features

- Bilingual chat with automatic language detection and matching replies
- Free keyword-based RAG grounding with source citation chips in the UI
- Bounded multi-turn conversation memory (last 6 turns)
- Groq-to-Gemini automatic fallback with retry on transient errors
- In-memory per-IP rate limiting and a short opening-question cache
  (both best-effort, per warm server instance, zero additional cost)
- Voice input via the browser's native Web Speech API (Chromium-only,
  feature-detected)
- An optional post-chat feedback prompt, gated by an environment variable
- Zero-cost real-usage logging (language, length, timestamp) via Vercel's
  function logs

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

### Connecting an AI backend

The chat works out of the box with a friendly "not configured yet" message,
but to get real answers you need an API key from one provider:

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in **one** of the two keys in `.env.local`:
   - `GROQ_API_KEY`: get one at [console.groq.com/keys](https://console.groq.com/keys) (checked first)
   - `GEMINI_API_KEY`: get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (used if no Groq key is set)
3. Restart the dev server.

`.env.local` is git-ignored and never committed. See `.env.local.example`
for the documented placeholders. `NEXT_PUBLIC_FEEDBACK_SURVEY_URL` is
optional and controls the on-site feedback prompt.

## Project structure

```
app/
  page.tsx                    Homepage
  about/page.tsx               About page (team bios, publications)
  evidence/page.tsx            Evidence page (survey charts + CSV download)
  api/chat/route.ts            API route: rate limiting, retrieval, generation
  layout.tsx, globals.css, icon.svg, favicon.ico
components/
  Header.tsx, Footer.tsx, Logo.tsx
  Hero.tsx, ProblemSection.tsx, SolutionSection.tsx
  DemoSection.tsx, ChatInterface.tsx   The chat widget itself
  ProofStrip.tsx                Homepage real-usage stat strip
  AboutSection.tsx, FeedbackPrompt.tsx
  evidence/Charts.tsx           Recharts components for the evidence page
lib/
  retrieval.ts                  RAG retrieval and scoring engine
  survey-data.ts                Parsed/typed survey data for charts
  knowledge/*.json               The RAG corpus (Wikipedia + policy docs)
public/data/
  ai-janala-survey-responses.csv   The real 500-response survey (downloadable)
```

## Build

```bash
npm run build
```
