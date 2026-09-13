export default function Footer() {
  return (
    <footer className="bg-gray-900 px-4 py-10 text-gray-300">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center text-sm sm:text-base">
        <nav
          aria-label="Footer"
          className="mb-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm"
        >
          <a href="/#demo" className="text-gray-300 hover:text-white hover:underline">
            Try the demo
          </a>
          <a href="/evidence" className="text-gray-300 hover:text-white hover:underline">
            Evidence
          </a>
          <a href="/about" className="text-gray-300 hover:text-white hover:underline">
            About
          </a>
        </nav>
        <p>
          Contact:{" "}
          <a
            href="mailto:shoumyac@student.unimelb.edu.au"
            className="font-medium text-white hover:underline"
          >
            shoumyac@student.unimelb.edu.au
          </a>
        </p>
        <p className="text-gray-400">University of Melbourne</p>
        <p className="mt-2 text-xs text-gray-500">
          © {new Date().getFullYear()} AI Janala
        </p>
      </div>
    </footer>
  );
}
