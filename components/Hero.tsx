export default function Hero() {
  return (
    <section className="bg-brand-green px-4 py-16 text-white sm:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
          Bengali AI Literacy System
        </span>
        <h1 className="mt-3 flex items-baseline gap-2 text-3xl font-bold leading-tight sm:text-5xl">
          <span>AI</span>
          <span className="font-bengali">জানালা</span>
        </h1>
        <p className="mt-4 text-lg font-medium sm:text-2xl">
          Making AI understandable for everyone, in your language.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          An AI literacy tool for Bengali and English speakers, built for
          communities that current AI education ignores.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href="#demo"
            className="w-full rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-brand-green transition-colors hover:bg-brand-green-light sm:w-auto sm:text-base"
          >
            Try the Demo
          </a>
          <a
            href="#about"
            className="w-full rounded-full border border-white px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto sm:text-base"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
