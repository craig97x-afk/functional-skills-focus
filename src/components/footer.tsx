import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white/70">
      <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-slate-500 flex flex-wrap items-center gap-4">
        <div className="font-medium text-slate-700">Functional Skills Focus</div>
        <span className="hidden sm:inline-block text-slate-300">•</span>
        <Link className="hover:text-slate-700" href="/legal/terms">
          Terms
        </Link>
        <Link className="hover:text-slate-700" href="/legal/privacy">
          Privacy
        </Link>
        <Link className="hover:text-slate-700" href="/legal/refunds">
          Refunds
        </Link>
        <Link className="hover:text-slate-700" href="/legal/safeguarding">
          Safeguarding
        </Link>
        <Link className="hover:text-slate-700" href="/contact">
          Contact
        </Link>
      </div>
    </footer>
  );
}
