import Link from "next/link";

const buyUrl = process.env.NEXT_PUBLIC_WIDGET_BUY_URL;
const hasBuyUrl = Boolean(buyUrl);

export default function AccessibilityWidgetPage() {
  return (
    <main className="space-y-10">
      <section className="apple-card p-8">
        <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
          Accessibility
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Accessibility Widget Pack
        </h1>
        <p className="apple-subtle mt-3 max-w-2xl">
          A ready-to-drop accessibility panel with text-to-speech, visual
          controls, reading supports, and presets designed for learning sites.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="apple-pill">One-time purchase</div>
          <div className="apple-pill">Instant download</div>
          <div className="apple-pill">Commercial use</div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="text-2xl font-semibold">£2.99</div>
          {hasBuyUrl ? (
            <Link className="apple-button text-white" href={buyUrl as string}>
              Buy the widget
            </Link>
          ) : (
            <button className="apple-button text-white" type="button" disabled>
              Buy link not set
            </button>
          )}
        </div>
        <div className="text-xs text-[color:var(--muted-foreground)] mt-3">
          {hasBuyUrl
            ? "You will receive the widget files and setup instructions after purchase."
            : "Set NEXT_PUBLIC_WIDGET_BUY_URL to your checkout link."}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="apple-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">What you get</h2>
          <ul className="apple-subtle space-y-2">
            <li>Accessibility widget component (React + CSS).</li>
            <li>Presets for vision, motor, cognitive, ADHD, and epileptic safe.</li>
            <li>Reading tools: reader view, stop animations, highlight links.</li>
            <li>Setup guide + usage notes.</li>
          </ul>
        </div>
        <div className="apple-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">Quick setup</h2>
          <ol className="apple-subtle space-y-2 list-decimal list-inside">
            <li>Drop the component into your layout.</li>
            <li>Copy the CSS helpers.</li>
            <li>Configure default settings.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
