export default function ProblemSection() {
  return (
    <section className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-4xl">
            230 million people. Zero AI literacy tools in their language.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Bengali is the 7th most spoken language in the world, yet it has
            almost no AI education resources. AI systems are already being
            deployed across Bangladesh’s government services, banking, and
            education, often without the general public understanding what
            AI actually is or how it affects their daily lives.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-green/15 bg-brand-green-light p-8 text-center">
          <p className="text-5xl font-extrabold tracking-tight text-brand-green sm:text-6xl">
            230M
          </p>
          <p className="mt-3 text-sm font-medium text-gray-700 sm:text-base">
            Bengali speakers worldwide, with almost no AI literacy resources
            available in their own language.
          </p>
        </div>
      </div>
    </section>
  );
}
