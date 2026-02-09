export default function PrivacyPage() {
  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>

      <p className="text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString("en-GB")}
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">1. What we collect</h2>
        <p>
          We collect account details (name, email, date of birth if provided), learning activity (attempts, progress,
          notes, flashcards, exam countdowns), support messages, and subscription or purchase status. Payments are
          processed by Stripe and we do not store full card details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. How we use your data</h2>
        <p>
          We use data to provide the service, personalise learning, show progress, respond to support messages, manage
          subscriptions and guide purchases, and maintain platform security.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Legal basis</h2>
        <p>
          We process data to perform the contract (provide the service), meet legal obligations, and for legitimate
          interests (security and improvement).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Sharing</h2>
        <p>
          We share data with service providers strictly as needed: Supabase (data hosting/auth) and Stripe (payments).
          We do not sell your personal data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. Retention</h2>
        <p>
          We retain data for as long as your account is active or as required for legal and accounting purposes. You can
          request deletion subject to legal requirements.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. Your rights</h2>
        <p>
          You may request access, correction, deletion, or restriction of your data, and object to certain processing,
          subject to applicable law (UK GDPR).
        </p>
      </section>
    </main>
  );
}
