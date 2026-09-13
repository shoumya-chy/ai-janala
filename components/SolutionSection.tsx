const PLANNED_FEATURES = [
  "Voice input for regional Bangladeshi dialects (Chittagonian, Sylheti, Rajshahi)",
  "Offline mode for low-connectivity areas",
  "Mobile-first design",
];

export default function SolutionSection() {
  return (
    <section className="bg-brand-green-light/40 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-4xl">
          Ask anything about AI. Get answers in Bengali or English.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-gray-600 sm:text-lg">
          Type your question in Bengali or English and get a clear, simple
          explanation, written for someone with no technical background, not
          for engineers.
        </p>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-green">
            Planned features (coming soon)
          </h3>
          <ul className="mt-4 space-y-3">
            {PLANNED_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-gray-700 sm:text-base"
              >
                <span aria-hidden="true" className="mt-1 text-brand-green">
                  •
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
