"use client";

export default function PrintButton() {
  return (
    <div className="flex flex-col items-end gap-1 print-hidden">
      <button
        type="button"
        className="apple-pill"
        onClick={() => window.print()}
      >
        Download PDF
      </button>
      <span className="text-xs text-[color:var(--muted-foreground)]">
        Choose “Save as PDF” in the print dialog.
      </span>
    </div>
  );
}
