/**
 * A tiny, dependency-free keyword retriever used to ground AI Janala's
 * answers in real AI-literacy source material instead of relying purely
 * on the base model's memorised knowledge.
 *
 * This is deliberately simple (no embeddings, no vector database, no
 * external API calls) so it costs nothing to run and has no new
 * dependency or service to configure. It scores each chunk by keyword
 * and word overlap against the user's message and only returns chunks
 * that clear a minimum relevance bar, so it stays silent unless a real
 * match is found.
 *
 * The corpus (lib/knowledge/*.json) is drawn from freely licensed or
 * official public sources about AI, machine learning, and Bangladesh's
 * ICT and AI policy: the Bengali Wikipedia articles on Artificial
 * Intelligence and Machine Learning (CC BY-SA), the government's draft
 * National AI Policy 2026-2030, the National ICT Policy 2018, and the
 * National Digital Commerce Policy 2018 (Bangladesh Gazette). Each
 * document below carries its own sourceUrl and sourceNote.
 *
 * NOTE: an earlier version of this file grounded answers in the
 * Bangladesh Constitution's Fundamental Rights chapter. That was the
 * wrong source for an AI-literacy tool (the constitution has nothing to
 * do with AI, and the bot ended up answering plain civics questions),
 * so it was replaced with the AI/ICT-policy corpus described above.
 */

import wikipediaAi from "@/lib/knowledge/wikipedia-ai-bn.json";
import wikipediaMl from "@/lib/knowledge/wikipedia-ml-bn.json";
import nationalAiPolicy from "@/lib/knowledge/bd-national-ai-policy-2026-2030.json";
import nationalIctPolicy from "@/lib/knowledge/bd-national-ict-policy-2018.json";
import digitalCommercePolicy from "@/lib/knowledge/bd-digital-commerce-policy-2018.json";

export interface KnowledgeChunk {
  id: string;
  title: string;
  text: string;
  verbatim: boolean;
  keywords: string[];
}

interface KnowledgeDocument {
  documentTitle: string;
  sourceUrl: string;
  sourceNote: string;
  chunks: KnowledgeChunk[];
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
  documentTitle: string;
  sourceUrl: string;
}

const DOCUMENTS: KnowledgeDocument[] = [
  wikipediaAi,
  wikipediaMl,
  nationalAiPolicy,
  nationalIctPolicy,
  digitalCommercePolicy,
];

// Below this score a match is treated as coincidental overlap, not a real
// signal that the question is actually about this chunk's content.
const MIN_SCORE = 2;
const MAX_RESULTS = 2;

function normalise(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function scoreChunk(queryTokens: Set<string>, chunk: KnowledgeChunk): number {
  let score = 0;

  for (const keyword of chunk.keywords) {
    const keywordTokens = normalise(keyword);
    if (keywordTokens.length === 0) continue;
    const allTokensPresent = keywordTokens.every((token) =>
      queryTokens.has(token)
    );
    if (allTokensPresent) {
      score += keywordTokens.length >= 2 ? 3 : 2;
    }
  }

  const titleTokens = normalise(chunk.title);
  for (const token of titleTokens) {
    if (queryTokens.has(token)) score += 1;
  }

  return score;
}

export function retrieve(message: string): RetrievedChunk[] {
  const queryTokens = new Set(normalise(message));
  if (queryTokens.size === 0) return [];

  const scored: RetrievedChunk[] = [];

  for (const doc of DOCUMENTS) {
    for (const chunk of doc.chunks) {
      const score = scoreChunk(queryTokens, chunk);
      if (score >= MIN_SCORE) {
        scored.push({
          ...chunk,
          score,
          documentTitle: doc.documentTitle,
          sourceUrl: doc.sourceUrl,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, MAX_RESULTS);
}

export function buildGroundingContext(chunks: RetrievedChunk[]): {
  contextBlock: string;
  citations: { label: string; sourceUrl: string }[];
} {
  if (chunks.length === 0) {
    return { contextBlock: "", citations: [] };
  }

  const lines = chunks.map((chunk) => {
    const certainty = chunk.verbatim
      ? "verbatim quotation"
      : "plain-language summary, not the exact original wording";
    return `From "${chunk.documentTitle}", section "${chunk.title}" [${certainty}]: ${chunk.text}`;
  });

  const contextBlock = `The following material was retrieved automatically from AI Janala's reference library (Bengali Wikipedia's AI and machine learning articles, and Bangladesh's public ICT and AI policy documents) because it looked relevant to the user's question, it may not be. Use it only if it genuinely answers the question, name the source document when you do (for example "Bangladesh's draft National AI Policy 2026-2030"), say plainly if a passage is a summary rather than exact original wording, and remind the user this is general informational material, not an official legal interpretation, for anything policy-sensitive.

${lines.join("\n")}`;

  const citations = chunks.map((chunk) => ({
    label: `${chunk.documentTitle}: ${chunk.title}`,
    sourceUrl: chunk.sourceUrl,
  }));

  return { contextBlock, citations };
}
