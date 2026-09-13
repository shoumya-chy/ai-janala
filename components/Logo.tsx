interface LogoProps {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}

// Icon mark: the Bengali letter "অ" (the first letter of the alphabet, the
// letter every child learns first) on a brand-green circular badge. Chosen
// over a speech-bubble treatment because a circle compresses more cleanly
// to favicon scale. Rendered as inline SVG (not an image) so it stays crisp
// at any size and inherits the site's Bengali font via the "font-bengali"
// utility rather than shipping a separate font file.
//
// Wordmark: "AI জানালা" ("AI Window") - AI in Latin script, "জানালা"
// (Janala, "window") in Bengali script, the site's name.
export default function Logo({
  className = "",
  markClassName = "",
  showWordmark = true,
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 56 56"
        aria-hidden="true"
        className={`h-9 w-9 shrink-0 ${markClassName}`}
      >
        <circle cx="28" cy="28" r="26" fill="#006A4E" />
        <text
          x="28"
          y="29"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-bengali"
          fontWeight="700"
          fontSize="28"
          fill="white"
        >
          অ
        </text>
      </svg>
      {showWordmark && (
        <span className="flex items-baseline gap-1.5 text-xl font-extrabold tracking-tight text-gray-900">
          <span className="text-brand-green">AI</span>
          <span className="font-bengali">জানালা</span>
        </span>
      )}
    </span>
  );
}
