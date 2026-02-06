"use client";

export default function PrintButton() {
  return (
    <button
      className="apple-pill print:hidden"
      onClick={() => window.print()}
      type="button"
    >
      Print
    </button>
  );
}
