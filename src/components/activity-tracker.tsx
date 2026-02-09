"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ActivityTracker() {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const start = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;

      const ping = () => {
        fetch("/api/activity/ping", { method: "POST" }).catch(() => undefined);
      };

      ping();
      timerRef.current = window.setInterval(ping, 60_000);
    };

    start();

    return () => {
      active = false;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  return null;
}
