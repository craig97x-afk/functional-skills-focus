"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      className="apple-pill print-hidden"
      onClick={() => window.print()}
    >
      Print report
    </button>
  );
}
