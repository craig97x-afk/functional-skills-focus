export default function SafeguardingPage() {
  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Safeguarding</h1>

      <p className="text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString("en-GB")}
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Our approach</h2>
        <p>
          Functional Skills Focus is an online learning platform. We take safeguarding seriously and aim to provide a
          safe, respectful environment for learners.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. Under-18 learners</h2>
        <p>
          If a learner is under 18, we recommend a parent/guardian or centre monitors their use of the platform. We do
          provide a support messaging feature for learner questions. There is no public student-to-student chat, and
          messages are intended for educational support.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Reporting concerns</h2>
        <p>
          If you have a safeguarding concern, contact us via the Contact page. If a child is in immediate danger, contact
          emergency services.
        </p>
      </section>
    </main>
  );
}
