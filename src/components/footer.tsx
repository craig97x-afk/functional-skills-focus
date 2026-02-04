import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-gray-600 flex flex-wrap gap-4">
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/refunds">Refunds</Link>
        <Link href="/legal/safeguarding">Safeguarding</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
