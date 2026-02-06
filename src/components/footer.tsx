import Link from "next/link";

export default function Footer() {
  return (
    <footer className="apple-footer">
      <div className="mx-auto max-w-6xl px-6 py-8 text-xs flex flex-wrap items-center gap-4">
        <div className="font-medium text-[color:var(--foreground)]">
          Functional Skills Focus
        </div>
        <span className="hidden sm:inline-block opacity-50">•</span>
        <Link className="transition" href="/legal/terms">
          Terms
        </Link>
        <Link className="transition" href="/legal/privacy">
          Privacy
        </Link>
        <Link className="transition" href="/legal/refunds">
          Refunds
        </Link>
        <Link className="transition" href="/legal/safeguarding">
          Safeguarding
        </Link>
        <Link className="transition" href="/contact">
          Contact
        </Link>
      </div>
    </footer>
  );
}
