export default function RefundsPage() {
  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Refunds & Cancellation</h1>

      <p className="text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString("en-GB")}
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Cancelling</h2>
        <p>
          You can cancel your subscription at any time using the Manage Billing link in your account. Cancellation takes
          effect at the end of your current billing period.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. Refunds</h2>
        <p>
          Subscription fees are generally non-refundable once a billing period has started. If you believe you were
          charged in error, contact support promptly and we will review the situation.
        </p>
        <p>
          Digital guide purchases are typically non-refundable once access is granted, unless required by law or where
          a payment error has occurred.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Technical issues</h2>
        <p>
          If you experience technical problems preventing access, contact us. We will try to resolve issues quickly and
          fairly.
        </p>
      </section>
    </main>
  );
}
