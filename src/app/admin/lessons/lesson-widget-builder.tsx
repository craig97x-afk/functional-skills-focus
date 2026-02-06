"use client";

import { useState } from "react";

type Props = {
  body: string;
  onInsert: (nextBody: string) => void;
};

function buildWidgetBlock(lines: string[]) {
  const block = ["```widget", ...lines, "```"].join("\n");
  return block;
}

export default function LessonWidgetBuilder({ body, onInsert }: Props) {
  const [type, setType] = useState<"clock" | "bar" | "shape">("clock");
  const [clockTime, setClockTime] = useState("10:30");
  const [clockLabel, setClockLabel] = useState("Half past ten");
  const [barTitle, setBarTitle] = useState("Fruit sold");
  const [barData, setBarData] = useState("Apples=5, Bananas=3, Oranges=8");
  const [shapeType, setShapeType] = useState("rectangle");
  const [shapeLabel, setShapeLabel] = useState("Rectangle 4 x 6");

  function insertWidget() {
    let lines: string[] = [];

    if (type === "clock") {
      lines = [
        "type: clock",
        `time: ${clockTime}`,
        `label: ${clockLabel}`,
      ];
    } else if (type === "bar") {
      lines = [
        "type: bar",
        `title: ${barTitle}`,
        `data: ${barData}`,
      ];
    } else {
      lines = [
        "type: shape",
        `shape: ${shapeType}`,
        `label: ${shapeLabel}`,
      ];
    }

    const block = buildWidgetBlock(lines);
    const nextBody = body ? `${body}\n\n${block}\n` : `${block}\n`;
    onInsert(nextBody);
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="text-sm font-semibold">Lesson widgets</div>
      <p className="text-sm text-slate-500">
        Insert a widget block into the lesson body. You can edit the text after
        inserting.
      </p>

      <label className="block">
        <span className="text-sm">Widget type</span>
        <select
          className="mt-1 w-full rounded-md border p-2"
          value={type}
          onChange={(e) => setType(e.target.value as "clock" | "bar" | "shape")}
        >
          <option value="clock">Clock</option>
          <option value="bar">Bar chart</option>
          <option value="shape">Shape</option>
        </select>
      </label>

      {type === "clock" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm">Time (HH:MM)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={clockTime}
              onChange={(e) => setClockTime(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Label</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={clockLabel}
              onChange={(e) => setClockLabel(e.target.value)}
            />
          </label>
        </div>
      )}

      {type === "bar" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm">Chart title</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={barTitle}
              onChange={(e) => setBarTitle(e.target.value)}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm">Data (Label=Value, ...)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={barData}
              onChange={(e) => setBarData(e.target.value)}
            />
          </label>
        </div>
      )}

      {type === "shape" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm">Shape type</span>
            <select
              className="mt-1 w-full rounded-md border p-2"
              value={shapeType}
              onChange={(e) => setShapeType(e.target.value)}
            >
              <option value="rectangle">Rectangle</option>
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="triangle">Triangle</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm">Label</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={shapeLabel}
              onChange={(e) => setShapeLabel(e.target.value)}
            />
          </label>
        </div>
      )}

      <button className="rounded-md border px-3 py-2" onClick={insertWidget}>
        Insert widget block
      </button>
    </div>
  );
}
