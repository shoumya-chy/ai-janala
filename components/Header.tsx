import Logo from "./Logo";

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Try the demo", href: "/#demo" },
  { label: "Evidence", href: "/evidence" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center" aria-label="AI Janala home">
          <Logo />
        </a>
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 sm:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-green"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="/#demo"
          className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-green-dark sm:hidden"
        >
          Try Demo
        </a>
      </div>
    </header>
  );
}
