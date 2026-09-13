import { SURVEY } from "@/lib/survey-data";

const STATS = [
  { value: `${SURVEY.n}+`, label: "Real users surveyed" },
  { value: `${SURVEY.districts}`, label: "Districts across Bangladesh" },
  { value: `${SURVEY.recommendYesPct}%`, label: "Would recommend it" },
  { value: `${SURVEY.avgClarity}/5`, label: "Avg. clarity rating" },
];

export default function ProofStrip() {
  return (
    <section className="border-y border-gray-100 bg-white px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-brand-green sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-gray-400 sm:text-sm">
          Field-tested with real users across Bangladesh.{" "}
          <a
            href="/evidence"
            className="font-medium text-brand-green hover:underline"
          >
            See the full evidence
          </a>
        </p>
      </div>
    </section>
  );
}
