"use client";

import { useEffect } from "react";

export default function LessonViewTracker({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    if (!lessonId) return;
    fetch("/api/lesson/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    }).catch(() => undefined);
  }, [lessonId]);

  return null;
}
