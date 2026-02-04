export default function TermsPage() {
  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Terms & Conditions</h1>

      <p className="text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString("en-GB")}
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Who we are</h2>
        <p>
          Functional Skills Focus provides an online learning platform offering Functional Skills Maths educational
          resources, including lessons, practice questions, and progress tracking. We are not a school, exam board, or
          awarding body.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. Account and access</h2>
        <p>
          You must provide accurate account information. You are responsible for keeping your login details secure.
          Access is personal and must not be shared.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Subscriptions and billing</h2>
        <p>
          Subscription payments are handled by Stripe. Subscriptions renew automatically unless cancelled via the billing
          portal. Access to paid features may be restricted if your subscription is inactive.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Educational content disclaimer</h2>
        <p>
          Content is provided for educational support and exam preparation. We do not guarantee specific outcomes or
          grades. Learners should confirm exam requirements with their centre or awarding body.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. Acceptable use</h2>
        <p>
          You agree not to misuse the platform, attempt to access other users&apos; data, scrape content, or interfere
          with platform operation. We may suspend accounts for abuse.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. Intellectual property</h2>
        <p>
          All platform content (lessons, questions, designs) is owned by Functional Skills Focus or licensed to us. You
          may not copy, redistribute, or sell our content without written permission.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, we are not liable for indirect losses or consequential damages. Nothing
          in these terms limits liability where it is unlawful to do so.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">8. Contact</h2>
        <p>
          For support, billing, or legal queries, use the Contact page or email the address associated with the platform.
        </p>
      </section>
    </main>
  );
}
