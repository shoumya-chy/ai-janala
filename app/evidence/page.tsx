import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SURVEY, CHART_COLORS as C } from "@/lib/survey-data";
import {
  HorizontalBarChart,
  DonutChart,
  ScoreHistogram,
  RecommendByPersonaChart,
  RecommendByClarityChart,
  Heatmap,
} from "@/components/evidence/Charts";

export const metadata: Metadata = {
  title: "Survey Evidence | AI Janala",
  description:
    "Field validation results from 500 AI Janala users across 10 Bangladeshi districts: what they asked, how clear and trustworthy they found the answers, and what to fix next.",
};

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
      <p className="text-3xl font-bold text-brand-green sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 text-center">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-green">{eyebrow}</span>
      <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
      {sub && <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">{sub}</p>}
    </div>
  );
}

function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 ${className}`}>
      {title && <h3 className="mb-4 text-sm font-semibold text-gray-800">{title}</h3>}
      {children}
    </div>
  );
}

const CSV_HREF = "/data/ai-janala-survey-responses.csv";

export default function EvidencePage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="bg-brand-green-light px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-white px-3 py-1 text-xs font-semibold text-brand-green-dark">
            Field validation
          </span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-5xl">
            What {SURVEY.n} real users told us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-700 sm:text-lg">
            A structured feedback survey run across six user groups and {SURVEY.districts}{" "}
            districts in Bangladesh, covering what people asked AI Janala, how clear and
            trustworthy they found the answers, and what to build next. Every chart below
            is computed directly from the response data.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={CSV_HREF}
              download
              className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark"
            >
              Download raw responses (CSV)
            </a>
            <span className="text-xs text-gray-500">{SURVEY.n} rows, open format, no personal identifiers</span>
          </div>
        </div>
      </section>

      {/* KPI row */}
      <section className="bg-white px-4 py-10 sm:py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          <StatTile value={`${SURVEY.n}`} label="Respondents" />
          <StatTile value={`${SURVEY.districts}`} label="Districts reached" />
          <StatTile value={`${SURVEY.recommendYesPct}%`} label="Would recommend" />
          <StatTile value={`${SURVEY.avgClarity}/5`} label="Avg. clarity" />
          <StatTile value={`${SURVEY.avgTrust}/5`} label="Avg. trust" />
          <StatTile value={`${SURVEY.bengaliInclusivePct}%`} label="Used Bengali" />
        </div>
      </section>

      {/* Who we reached */}
      <section className="bg-gray-50 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Who we reached"
            title="Six user groups, ten districts"
            sub="Respondents were recruited by quota across six user groups so the sample isn't just students or just tech workers."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Respondent group">
              <HorizontalBarChart data={SURVEY.persona} />
            </Card>
            <Card title="How they heard about AI Janala">
              <HorizontalBarChart data={SURVEY.channel} color={C.blue} />
            </Card>
          </div>
          <Card title="Responses by district" className="mt-6">
            <HorizontalBarChart data={SURVEY.district} color={C.brandGreenDark} rowHeight={30} />
            <p className="mt-3 text-xs text-gray-500">
              Dhaka accounts for {SURVEY.dhakaShare}% of responses, the remaining {(100 - SURVEY.dhakaShare).toFixed(1)}% spread across nine other districts.
            </p>
          </Card>
        </div>
      </section>

      {/* How they used it */}
      <section className="bg-white px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="How they used it"
            title="Bengali-first, mobile-first"
            sub="Language and device choice, and what people actually came to ask about."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Card title="Language used in chat">
              <DonutChart data={SURVEY.language} colors={[C.blue, C.orange, C.aqua]} />
            </Card>
            <Card title="Device">
              <DonutChart data={SURVEY.device} colors={[C.blue, C.orange, C.aqua]} />
            </Card>
          </div>
          <Card title="What they asked about" className="mt-6">
            <HorizontalBarChart data={SURVEY.topic} color={C.brandGreen} rowHeight={30} />
          </Card>
        </div>
      </section>

      {/* Did it help */}
      <section className="bg-gray-50 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Did it actually help"
            title="Clarity is what drives recommendations"
            sub="Two 1-5 ratings per response: how clear the answer was, and how much they trusted it was accurate."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Card title="Clarity score">
              <ScoreHistogram data={SURVEY.clarityHist} color={C.blue} label="Clarity" />
            </Card>
            <Card title="Trust score">
              <ScoreHistogram data={SURVEY.trustHist} color={C.orange} label="Trust" />
            </Card>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="Would you recommend this?">
              <DonutChart data={SURVEY.recommend} colors={[C.blue, C.neutral, C.red]} />
            </Card>
            <Card title="Recommend rate by clarity score">
              <RecommendByClarityChart data={SURVEY.recommendByClarity} />
              <p className="mt-2 text-xs text-gray-500">
                Respondents who rated clarity 4-5 recommended AI Janala roughly twice as
                often as those who rated it 2-3, the strongest single pattern in the data.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Recommend by segment */}
      <section className="bg-white px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="By user group"
            title="Recommendation rate holds up across every segment"
            sub="No group fell below 57% Yes, and IT professionals (72%) and students (69%) led."
          />
          <Card>
            <RecommendByPersonaChart data={SURVEY.recommendByPersona} />
          </Card>
        </div>
      </section>

      {/* Language / device by segment */}
      <section className="bg-gray-50 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="By user group"
            title="Language and device follow real-world patterns"
            sub="Housewives and small business owners chat almost entirely in Bengali on a phone; IT professionals lean English on a laptop. That is the split AI Janala was built to serve, not to flatten."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Language used, by respondent group (% of that group)">
              <Heatmap rows={SURVEY.heatLanguage} columns={["Bengali", "Both", "English"]} />
            </Card>
            <Card title="Device, by respondent group (% of that group)">
              <Heatmap rows={SURVEY.heatDevice} columns={["Phone", "Laptop/desktop", "Tablet"]} />
            </Card>
          </div>
        </div>
      </section>

      {/* What to fix next */}
      <section className="bg-white px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="What to fix next"
            title="The roadmap is coming straight from this data"
            sub="Respondents chose the closest option from a fixed list for both questions below."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="What was confusing, wrong, or missing">
              <HorizontalBarChart data={SURVEY.pain} color={C.red} rowHeight={38} />
            </Card>
            <Card title="What would make it more useful">
              <HorizontalBarChart data={SURVEY.improve} color={C.brandGreen} rowHeight={34} />
            </Card>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="bg-gray-50 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Methodology" title="How this was collected" />
          <Card>
            <ul className="space-y-3 text-sm text-gray-700 sm:text-base">
              <li>
                <span className="font-semibold text-gray-900">Sample:</span> {SURVEY.n} responses,
                quota-sampled across six user groups (BCS Cadre, Student, Banker, Small Business
                Owner, IT Professional, Housewife) at 100 / 100 / 100 / 100 / 50 / 50.
              </li>
              <li>
                <span className="font-semibold text-gray-900">Recruitment:</span> primarily
                Facebook/WhatsApp ({SURVEY.channel[0].count} responses) and LinkedIn (
                {SURVEY.channel[1].count}), plus word of mouth, university networks, and other
                channels.
              </li>
              <li>
                <span className="font-semibold text-gray-900">Instrument:</span> a 10-question
                structured form covering discovery channel, language, device, topic asked, a
                1-5 clarity rating, a 1-5 trust rating, closest-match issue and improvement
                options, recommendation intent, and self-reported age range and district.
              </li>
              <li>
                <span className="font-semibold text-gray-900">Coverage:</span> {SURVEY.districts}{" "}
                districts, with Dhaka at {SURVEY.dhakaShare}% of the sample rather than the
                large majority a convenience sample from the capital alone would produce.
              </li>
            </ul>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <a href={CSV_HREF} download className="text-sm font-semibold text-brand-green hover:underline">
                Download the full response-level CSV
              </a>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}