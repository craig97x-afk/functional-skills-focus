import Link from "next/link";

export default function BillingSuccess() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Payment successful</h1>
      <p className="text-gray-500">Your subscription should activate shortly.</p>
      <Link href="/maths" className="inline-block rounded-md border px-3 py-2">
        Go to Maths
      </Link>
    </main>
  );
}
