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
  const [type, setType] = useState<
    "clock" | "bar" | "line" | "pie" | "numberline" | "fraction" | "shape"
  >("clock");
  const [clockTime, setClockTime] = useState("10:30");
  const [clockLabel, setClockLabel] = useState("Half past ten");
  const [barTitle, setBarTitle] = useState("Fruit sold");
  const [barData, setBarData] = useState("Apples=5, Bananas=3, Oranges=8");
  const [barYLabel, setBarYLabel] = useState("Units sold");
  const [barXLabel, setBarXLabel] = useState("Fruit");
  const [barUnit, setBarUnit] = useState("");
  const [barYMin, setBarYMin] = useState("0");
  const [barYMax, setBarYMax] = useState("10");
  const [barShowValues, setBarShowValues] = useState(true);
  const [lineTitle, setLineTitle] = useState("Weekly temperatures");
  const [lineData, setLineData] = useState("Mon=12, Tue=15, Wed=13, Thu=18");
  const [lineYLabel, setLineYLabel] = useState("°C");
  const [lineXLabel, setLineXLabel] = useState("Day");
  const [lineUnit, setLineUnit] = useState("°");
  const [lineYMin, setLineYMin] = useState("10");
  const [lineYMax, setLineYMax] = useState("20");
  const [pieTitle, setPieTitle] = useState("Class favourites");
  const [pieData, setPieData] = useState("Apples=4, Bananas=6, Oranges=3");
  const [pieUnit, setPieUnit] = useState("");
  const [numberMin, setNumberMin] = useState("0");
  const [numberMax, setNumberMax] = useState("10");
  const [numberStep, setNumberStep] = useState("1");
  const [numberHighlight, setNumberHighlight] = useState("6");
  const [numberLabel, setNumberLabel] = useState("Mark the value");
  const [fractionNumerator, setFractionNumerator] = useState("3");
  const [fractionDenominator, setFractionDenominator] = useState("4");
  const [fractionLabel, setFractionLabel] = useState("Three quarters");
  const [shapeType, setShapeType] = useState("rectangle");
  const [shapeLabel, setShapeLabel] = useState("Rectangle 4 x 6");
  const [shapeWidth, setShapeWidth] = useState("140");
  const [shapeHeight, setShapeHeight] = useState("90");

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
        `y_label: ${barYLabel}`,
        `x_label: ${barXLabel}`,
        `y_min: ${barYMin}`,
        `y_max: ${barYMax}`,
        `unit: ${barUnit}`,
        `show_values: ${barShowValues}`,
      ];
    } else if (type === "line") {
      lines = [
        "type: line",
        `title: ${lineTitle}`,
        `data: ${lineData}`,
        `y_label: ${lineYLabel}`,
        `x_label: ${lineXLabel}`,
        `y_min: ${lineYMin}`,
        `y_max: ${lineYMax}`,
        `unit: ${lineUnit}`,
      ];
    } else if (type === "pie") {
      lines = [
        "type: pie",
        `title: ${pieTitle}`,
        `data: ${pieData}`,
        `unit: ${pieUnit}`,
      ];
    } else if (type === "numberline") {
      lines = [
        "type: numberline",
        `min: ${numberMin}`,
        `max: ${numberMax}`,
        `step: ${numberStep}`,
        `highlight: ${numberHighlight}`,
        `label: ${numberLabel}`,
      ];
    } else if (type === "fraction") {
      lines = [
        "type: fraction",
        `numerator: ${fractionNumerator}`,
        `denominator: ${fractionDenominator}`,
        `label: ${fractionLabel}`,
      ];
    } else {
      lines = [
        "type: shape",
        `shape: ${shapeType}`,
        `label: ${shapeLabel}`,
        `width: ${shapeWidth}`,
        `height: ${shapeHeight}`,
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
          onChange={(e) =>
            setType(
              e.target.value as
                | "clock"
                | "bar"
                | "line"
                | "pie"
                | "numberline"
                | "fraction"
                | "shape"
            )
          }
        >
          <option value="clock">Clock</option>
          <option value="bar">Bar chart</option>
          <option value="line">Line graph</option>
          <option value="pie">Pie chart</option>
          <option value="numberline">Number line</option>
          <option value="fraction">Fraction</option>
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
          <label className="block">
            <span className="text-sm">Y-axis label</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={barYLabel}
              onChange={(e) => setBarYLabel(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">X-axis label</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={barXLabel}
              onChange={(e) => setBarXLabel(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Y min</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={barYMin}
              onChange={(e) => setBarYMin(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Y max</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={barYMax}
              onChange={(e) => setBarYMax(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Unit (optional)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={barUnit}
              onChange={(e) => setBarUnit(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={barShowValues}
              onChange={(e) => setBarShowValues(e.target.checked)}
            />
            <span className="text-sm">Show value labels</span>
          </label>
        </div>
      )}

      {type === "line" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm">Graph title</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={lineTitle}
              onChange={(e) => setLineTitle(e.target.value)}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm">Data (Label=Value, ...)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={lineData}
              onChange={(e) => setLineData(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Y-axis label</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={lineYLabel}
              onChange={(e) => setLineYLabel(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">X-axis label</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={lineXLabel}
              onChange={(e) => setLineXLabel(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Y min</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={lineYMin}
              onChange={(e) => setLineYMin(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Y max</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={lineYMax}
              onChange={(e) => setLineYMax(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Unit (optional)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={lineUnit}
              onChange={(e) => setLineUnit(e.target.value)}
            />
          </label>
        </div>
      )}

      {type === "pie" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm">Chart title</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={pieTitle}
              onChange={(e) => setPieTitle(e.target.value)}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm">Data (Label=Value, ...)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={pieData}
              onChange={(e) => setPieData(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Unit (optional)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={pieUnit}
              onChange={(e) => setPieUnit(e.target.value)}
            />
          </label>
        </div>
      )}

      {type === "numberline" && (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm">Minimum</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={numberMin}
              onChange={(e) => setNumberMin(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Maximum</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={numberMax}
              onChange={(e) => setNumberMax(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Step</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={numberStep}
              onChange={(e) => setNumberStep(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Highlight value</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={numberHighlight}
              onChange={(e) => setNumberHighlight(e.target.value)}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm">Label</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={numberLabel}
              onChange={(e) => setNumberLabel(e.target.value)}
            />
          </label>
        </div>
      )}

      {type === "fraction" && (
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="text-sm">Numerator</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={fractionNumerator}
              onChange={(e) => setFractionNumerator(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Denominator</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={fractionDenominator}
              onChange={(e) => setFractionDenominator(e.target.value)}
            />
          </label>
          <label className="block md:col-span-3">
            <span className="text-sm">Label</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={fractionLabel}
              onChange={(e) => setFractionLabel(e.target.value)}
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
          <label className="block">
            <span className="text-sm">Width (px)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={shapeWidth}
              onChange={(e) => setShapeWidth(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Height (px)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={shapeHeight}
              onChange={(e) => setShapeHeight(e.target.value)}
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
