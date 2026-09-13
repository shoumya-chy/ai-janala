interface ResearcherLink {
  label: string;
  href: string;
  external: boolean;
}

interface Researcher {
  name: string;
  initials: string;
  avatarClassName: string;
  roleLines: string[];
  links: ResearcherLink[];
}

const RESEARCHERS: Researcher[] = [
  {
    name: "Shoumya Chowdhury",
    initials: "SC",
    avatarClassName: "bg-brand-green",
    roleLines: [
      "AI governance researcher & ML engineer, University of Melbourne",
      "Australia Awards Scholar (DFAT) · Master of IT (Artificial Intelligence)",
      "Assistant Commissioner (Magistrate), Bangladesh Administrative Service (on study leave)",
    ],
    links: [
      {
        label: "shoumyac@student.unimelb.edu.au",
        href: "mailto:shoumyac@student.unimelb.edu.au",
        external: false,
      },
      {
        label: "linkedin.com/in/shoumya-chowdhury",
        href: "https://www.linkedin.com/in/shoumya-chowdhury/",
        external: true,
      },
    ],
  },
  {
    name: "Anmita Das",
    initials: "AD",
    avatarClassName: "bg-gray-700",
    roleLines: [
      "AI governance researcher & NLP researcher, University of Melbourne",
      "Engineering & IT Graduate Scholar · Master of IT (Artificial Intelligence)",
      "Lecturer & Head of ICT Department, Govt. Colleges, Bangladesh (BCS Education Cadre, on study leave)",
    ],
    links: [
      {
        label: "aadas@student.unimelb.edu.au",
        href: "mailto:aadas@student.unimelb.edu.au",
        external: false,
      },
      {
        label: "linkedin.com/in/anmita-das",
        href: "https://www.linkedin.com/in/anmita-das",
        external: true,
      },
    ],
  },
];

const PUBLICATIONS = [
  "Shoumya Chowdhury and Anmita Das shortlisted as panelists at the UNU Macau AI Conference 2026 (\"AI x Education: AI for Learning, Learning for AI\")",
  "Two papers accepted at IEEE IRAI 2026",
  "Two papers accepted at the 3rd AI in Finance Conference 2026 (Concordia, Montreal)",
  "A paper presented at IntelliSys 2026 (Springer LNNS)",
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-4xl">
            Built by researchers who understand the gap firsthand.
          </h2>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-brand-green-light px-3 py-1 text-xs font-semibold text-brand-green-dark">
            University of Melbourne
          </span>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {RESEARCHERS.map((person) => (
            <div
              key={person.name}
              className="rounded-2xl border border-gray-200 p-6 sm:p-8"
            >
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${person.avatarClassName}`}
                >
                  {person.initials}
                </span>
                <p className="text-lg font-semibold text-gray-900">
                  {person.name}
                </p>
              </div>

              <ul className="mt-4 space-y-1.5 text-sm text-gray-600 sm:text-base">
                {person.roleLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-1.5 border-t border-gray-100 pt-4 text-sm">
                {person.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="break-words font-medium text-brand-green hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-gray-50 p-6 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Publications
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-700 sm:text-base">
            {PUBLICATIONS.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-brand-green">
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-brand-green">
                •
              </span>
              <span>
                Pursuit (University of Melbourne):{" "}
                <a
                  href="https://pursuit.unimelb.edu.au/articles/developing-countries-are-writing-ai-laws-they-cannot-enforce"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-green hover:underline"
                >
                  “Developing Countries Are Writing AI Laws They Cannot
                  Enforce”
                </a>{" "}
                by Shoumya Chowdhury &amp; Anmita Das
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-brand-green">
                •
              </span>
              <span>
                BMC Environmental Science (Springer Nature):{" "}
                <a
                  href="https://doi.org/10.1186/s44329-026-00058-6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-green hover:underline"
                >
                  “Forecasting cold wave in Bangladesh: a validated machine
                  learning approach for early warning and vulnerability
                  reduction”
                </a>{" "}
                (Shoumya Chowdhury &amp; Anmita Das among the co-authors;
                DOI: 10.1186/s44329-026-00058-6)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
