"use client";

import { useTransition } from "react";

export default function GuardianLogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="apple-pill text-xs font-semibold"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/guardian/logout", { method: "POST" });
          window.location.href = "/guardian";
        })
      }
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
