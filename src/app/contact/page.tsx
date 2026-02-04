export default function ContactPage() {
  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Contact</h1>

      <section className="space-y-2">
        <h2 className="font-semibold">Support</h2>
        <p>
          Email: <span className="font-medium">support@yourdomain.co.uk</span>
        </p>
        <p className="text-sm text-gray-600">
          Typical response time: within 1–2 working days.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Billing</h2>
        <p>
          For subscription changes, use <span className="font-medium">Manage billing</span> in your dashboard.
        </p>
        <p className="text-sm text-gray-600">
          If you cannot access your account, email support with the email address you used to sign up.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Safeguarding</h2>
        <p>
          If you have a safeguarding concern, contact us via the support email above.
        </p>
        <p className="text-sm text-gray-600">
          If a child is in immediate danger, contact emergency services.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Business details</h2>
        <p className="text-sm text-gray-600">
          (Add your business name and address here before going live. Stripe may require this.)
        </p>
      </section>
    </main>
  );
}
