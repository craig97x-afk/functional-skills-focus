"use client";

import { useEffect, useState } from "react";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function MockTimer() {
  const [minutes, setMinutes] = useState(45);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setRunning(false);
    }
  }, [secondsLeft]);

  function startTimer() {
    setSecondsLeft(minutes * 60);
    setRunning(true);
  }

  function togglePause() {
    setRunning((prev) => !prev);
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(minutes * 60);
  }

  return (
    <div className="apple-card p-6 space-y-4">
      <div className="text-lg font-semibold">Mock timer</div>
      <p className="apple-subtle">
        Use a timer to simulate exam conditions. Choose the duration, then start.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-[color:var(--muted-foreground)]">
          Minutes
          <input
            type="number"
            min={10}
            max={180}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="ml-2 w-24 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1.5 text-sm text-[color:var(--foreground)]"
          />
        </label>
        <button className="apple-pill" onClick={startTimer}>
          Start
        </button>
        <button className="apple-pill" onClick={togglePause} disabled={secondsLeft === 0}>
          {running ? "Pause" : "Resume"}
        </button>
        <button className="apple-pill" onClick={resetTimer}>
          Reset
        </button>
      </div>

      <div className="text-4xl font-semibold tracking-tight">
        {formatTime(secondsLeft)}
      </div>
      {secondsLeft === 0 && (
        <div className="text-sm text-[color:var(--muted-foreground)]">
          Time&apos;s up. Review your answers or try another mock.
        </div>
      )}
    </div>
  );
}
