# AI Janala

A Bengali AI literacy system. AI Janala ("AI Window") is an MVP chat-based
AI literacy tool for Bengali and English speakers, built by Shoumya
Chowdhury and Anmita Das (Master of IT (AI), University of Melbourne).
Visitors can ask plain-language questions about artificial intelligence in
Bengali or English and get simple, jargon-free answers, powered by a hosted
LLM.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- `next/font/google`: Inter (English) and Noto Sans Bengali (Bengali)
- One API route (`app/api/chat/route.ts`) that proxies to Groq or Gemini

No database, no auth, no analytics. This is a thin chat UI over a hosted
LLM API.

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
for the documented placeholders.

## Project structure

```
app/
  api/chat/route.ts   API route: language detection + Groq/Gemini call
  layout.tsx           Root layout, fonts, global metadata
  page.tsx              Landing page (assembles the sections below)
  globals.css           Tailwind directives + base styles
components/
  Hero.tsx
  ProblemSection.tsx
  SolutionSection.tsx
  AboutSection.tsx
  DemoSection.tsx
  ChatInterface.tsx     Client component: the chat widget itself
  Footer.tsx
```

## Build

```bash
npm run build
```
