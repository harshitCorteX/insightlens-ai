import Link from "next/link";
export function LensMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 3 34.7 11.5V28.5L20 37 5.3 28.5V11.5L20 3Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="m20 3 8 17-8 17M5.3 11.5 24 13l10.7 15.5M5.3 28.5 16 13l18.7-1.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="m16 13 8 0 4 7-4 7h-8l-4-7 4-7Z" fill="currentColor" />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="InsightLens AI home">
      <span className="brand-mark">
        <LensMark />
      </span>
      <span>
        InsightLens<span className="brand-ai">AI</span>
      </span>
    </Link>
  );
}
