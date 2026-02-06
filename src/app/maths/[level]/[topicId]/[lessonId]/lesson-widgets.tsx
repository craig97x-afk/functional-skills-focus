type WidgetConfig = Record<string, string>;

const chartColors = [
  "var(--accent)",
  "#34d399",
  "#f59e0b",
  "#f97316",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
];

const chartGridColor = "rgba(148, 163, 184, 0.25)";
const chartAxisColor = "rgba(148, 163, 184, 0.65)";

function parseWidget(value: string): WidgetConfig {
  const config: WidgetConfig = {};
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (!key || rest.length === 0) return;
      const raw = rest.join(":").trim();
      config[key.trim()] = raw.replace(/^"|"$/g, "");
    });
  return config;
}

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return fallback;
}

function parseDataPairs(data: string): { label: string; value: number }[] {
  return data
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [label, rawValue] = pair.split("=");
      const value = Number(rawValue);
      return {
        label: (label ?? "").trim() || "Item",
        value: Number.isFinite(value) ? value : 0,
      };
    });
}

function buildTicks(minValue: number, maxValue: number, ticks = 5) {
  if (ticks < 2) return [minValue, maxValue];
  const span = maxValue - minValue || 1;
  return Array.from({ length: ticks }, (_, index) => {
    const ratio = index / (ticks - 1);
    return minValue + ratio * span;
  });
}

function formatValue(value: number, unit?: string) {
  const rounded = Math.round(value * 100) / 100;
  return unit ? `${rounded}${unit}` : `${rounded}`;
}

function ClockWidget({ time, label }: { time: string; label?: string }) {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  const safeHour = Number.isFinite(hour) ? hour % 12 : 0;
  const safeMinute = Number.isFinite(minute) ? minute : 0;

  const hourDeg = safeHour * 30 + safeMinute * 0.5;
  const minuteDeg = safeMinute * 6;

  return (
    <div className="apple-card p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Clock
      </div>
      <div className="flex flex-wrap items-center gap-6 mt-4">
        <div
          className="relative h-32 w-32 rounded-full border border-[color:var(--border)] shadow-sm"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(15,23,42,0.12))",
          }}
        >
          {Array.from({ length: 60 }).map((_, index) => (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 h-2 w-[1px]"
              style={{
                background:
                  index % 5 === 0
                    ? "var(--foreground)"
                    : "rgba(148, 163, 184, 0.45)",
                transform: `translate(-50%, -100%) rotate(${index * 6}deg)`,
                transformOrigin: "bottom center",
                height: index % 5 === 0 ? "10px" : "6px",
              }}
            />
          ))}
          {[12, 3, 6, 9].map((num) => (
            <span
              key={num}
              className="absolute text-xs font-semibold text-[color:var(--foreground)]"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) rotate(${
                  num * 30
                }deg) translate(0, -50px) rotate(${-num * 30}deg)`,
              }}
            >
              {num}
            </span>
          ))}
          <div
            className="absolute left-1/2 top-1/2 h-10 w-[3px] rounded-full bg-[color:var(--foreground)]"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
              transformOrigin: "bottom center",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-14 w-[2px] rounded-full"
            style={{
              background: "linear-gradient(180deg, var(--accent), #1d4ed8)",
              transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
              transformOrigin: "bottom center",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--foreground)]" />
        </div>
        <div>
          <div className="text-lg font-semibold">{label || time}</div>
          <div className="apple-subtle">Time shown: {time || "--:--"}</div>
        </div>
      </div>
    </div>
  );
}

function BarChartWidget({
  title,
  data,
  yLabel,
  xLabel,
  yMin,
  yMax,
  unit,
  showValues,
}: {
  title: string;
  data: string;
  yLabel?: string;
  xLabel?: string;
  yMin?: number;
  yMax?: number;
  unit?: string;
  showValues?: boolean;
}) {
  const items = parseDataPairs(data);
  const computedMax = Math.max(...items.map((i) => i.value), 1);
  const computedMin = Math.min(...items.map((i) => i.value), 0);
  const maxValue = Number.isFinite(yMax ?? NaN) ? (yMax as number) : computedMax;
  const minValue = Number.isFinite(yMin ?? NaN) ? (yMin as number) : computedMin;
  const ticks = buildTicks(minValue, maxValue, 5);
  const showValueLabels = showValues ?? true;

  const chart = {
    width: 100,
    height: 100,
    padding: { top: 8, right: 6, bottom: 20, left: 14 },
  };
  const innerWidth = chart.width - chart.padding.left - chart.padding.right;
  const innerHeight = chart.height - chart.padding.top - chart.padding.bottom;
  const barWidth = items.length > 0 ? innerWidth / items.length - 2 : 8;

  return (
    <div className="apple-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Bar chart
      </div>
      <div className="text-lg font-semibold">{title || "Bar chart"}</div>
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
        <svg viewBox="0 0 100 100" className="h-48 w-full">
          {ticks.map((tick, index) => {
            const ratio = (tick - minValue) / (maxValue - minValue || 1);
            const y = chart.padding.top + (1 - ratio) * innerHeight;
            return (
              <g key={`tick-${index}`}>
                <line
                  x1={chart.padding.left}
                  x2={chart.width - chart.padding.right}
                  y1={y}
                  y2={y}
                  stroke={chartGridColor}
                  strokeWidth="0.5"
                />
                <text
                  x={chart.padding.left - 2}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[color:var(--muted-foreground)]"
                  style={{ fontSize: "4px" }}
                >
                  {formatValue(tick, unit)}
                </text>
              </g>
            );
          })}

          <line
            x1={chart.padding.left}
            x2={chart.padding.left}
            y1={chart.padding.top}
            y2={chart.height - chart.padding.bottom}
            stroke={chartAxisColor}
            strokeWidth="0.7"
          />
          <line
            x1={chart.padding.left}
            x2={chart.width - chart.padding.right}
            y1={chart.height - chart.padding.bottom}
            y2={chart.height - chart.padding.bottom}
            stroke={chartAxisColor}
            strokeWidth="0.7"
          />

          {items.map((item, index) => {
            const x = chart.padding.left + index * (barWidth + 2) + 1;
            const ratio = (item.value - minValue) / (maxValue - minValue || 1);
            const height = Math.max(1, ratio * innerHeight);
            const y = chart.padding.top + innerHeight - height;
            return (
              <g key={`${item.label}-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(4, barWidth)}
                  height={height}
                  rx="1.5"
                  fill={chartColors[index % chartColors.length]}
                />
                {showValueLabels && (
                  <text
                    x={x + Math.max(4, barWidth) / 2}
                    y={y - 2}
                    textAnchor="middle"
                    className="fill-[color:var(--foreground)]"
                    style={{ fontSize: "4px" }}
                  >
                    {formatValue(item.value, unit)}
                  </text>
                )}
                <text
                  x={x + Math.max(4, barWidth) / 2}
                  y={chart.height - chart.padding.bottom + 6}
                  textAnchor="middle"
                  className="fill-[color:var(--muted-foreground)]"
                  style={{ fontSize: "4px" }}
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {yLabel && (
            <text
              x={6}
              y={chart.padding.top + innerHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90 6 ${chart.padding.top + innerHeight / 2})`}
              className="fill-[color:var(--muted-foreground)]"
              style={{ fontSize: "4px" }}
            >
              {yLabel}
            </text>
          )}
          {xLabel && (
            <text
              x={chart.padding.left + innerWidth / 2}
              y={chart.height - 2}
              textAnchor="middle"
              className="fill-[color:var(--muted-foreground)]"
              style={{ fontSize: "4px" }}
            >
              {xLabel}
            </text>
          )}
        </svg>
        {items.length === 0 && (
          <div className="text-sm text-[color:var(--muted-foreground)]">
            Add data like Apples=5, Bananas=3.
          </div>
        )}
      </div>
    </div>
  );
}

function LineChartWidget({
  title,
  data,
  yLabel,
  xLabel,
  yMin,
  yMax,
  unit,
}: {
  title: string;
  data: string;
  yLabel?: string;
  xLabel?: string;
  yMin?: number;
  yMax?: number;
  unit?: string;
}) {
  const items = parseDataPairs(data);
  const computedMax = Math.max(...items.map((i) => i.value), 1);
  const computedMin = Math.min(...items.map((i) => i.value), 0);
  const maxValue = Number.isFinite(yMax ?? NaN) ? (yMax as number) : computedMax;
  const minValue = Number.isFinite(yMin ?? NaN) ? (yMin as number) : computedMin;
  const ticks = buildTicks(minValue, maxValue, 5);

  if (items.length < 2) {
    return (
      <div className="apple-card p-5 space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Line graph
        </div>
        <div className="text-lg font-semibold">{title || "Line graph"}</div>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Add at least two points to draw a line.
        </p>
      </div>
    );
  }

  const chart = {
    width: 100,
    height: 100,
    padding: { top: 8, right: 8, bottom: 20, left: 14 },
  };
  const innerWidth = chart.width - chart.padding.left - chart.padding.right;
  const innerHeight = chart.height - chart.padding.top - chart.padding.bottom;

  const points = items
    .map((item, index) => {
      const x = chart.padding.left + (index / (items.length - 1)) * innerWidth;
      const ratio = (item.value - minValue) / (maxValue - minValue || 1);
      const y = chart.padding.top + (1 - ratio) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="apple-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Line graph
      </div>
      <div className="text-lg font-semibold">{title || "Line graph"}</div>
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
        <svg viewBox="0 0 100 100" className="h-48 w-full">
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((tick, index) => {
            const ratio = (tick - minValue) / (maxValue - minValue || 1);
            const y = chart.padding.top + (1 - ratio) * innerHeight;
            return (
              <g key={`tick-${index}`}>
                <line
                  x1={chart.padding.left}
                  x2={chart.width - chart.padding.right}
                  y1={y}
                  y2={y}
                  stroke={chartGridColor}
                  strokeWidth="0.5"
                />
                <text
                  x={chart.padding.left - 2}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[color:var(--muted-foreground)]"
                  style={{ fontSize: "4px" }}
                >
                  {formatValue(tick, unit)}
                </text>
              </g>
            );
          })}

          <line
            x1={chart.padding.left}
            x2={chart.padding.left}
            y1={chart.padding.top}
            y2={chart.height - chart.padding.bottom}
            stroke={chartAxisColor}
            strokeWidth="0.7"
          />
          <line
            x1={chart.padding.left}
            x2={chart.width - chart.padding.right}
            y1={chart.height - chart.padding.bottom}
            y2={chart.height - chart.padding.bottom}
            stroke={chartAxisColor}
            strokeWidth="0.7"
          />
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            points={points}
          />
          <polyline
            fill="url(#lineFill)"
            stroke="none"
            points={`${points} ${chart.width - chart.padding.right},${
              chart.height - chart.padding.bottom
            } ${chart.padding.left},${chart.height - chart.padding.bottom}`}
          />
          {items.map((item, index) => {
            const x = chart.padding.left + (index / (items.length - 1)) * innerWidth;
            const ratio = (item.value - minValue) / (maxValue - minValue || 1);
            const y = chart.padding.top + (1 - ratio) * innerHeight;
            return (
              <circle
                key={`${item.label}-${index}`}
                cx={x}
                cy={y}
                r="3"
                fill="var(--foreground)"
              />
            );
          })}
          {items.map((item, index) => {
            const x = chart.padding.left + (index / (items.length - 1)) * innerWidth;
            return (
              <text
                key={`${item.label}-label`}
                x={x}
                y={chart.height - chart.padding.bottom + 6}
                textAnchor="middle"
                className="fill-[color:var(--muted-foreground)]"
                style={{ fontSize: "4px" }}
              >
                {item.label}
              </text>
            );
          })}
          {yLabel && (
            <text
              x={6}
              y={chart.padding.top + innerHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90 6 ${chart.padding.top + innerHeight / 2})`}
              className="fill-[color:var(--muted-foreground)]"
              style={{ fontSize: "4px" }}
            >
              {yLabel}
            </text>
          )}
          {xLabel && (
            <text
              x={chart.padding.left + innerWidth / 2}
              y={chart.height - 2}
              textAnchor="middle"
              className="fill-[color:var(--muted-foreground)]"
              style={{ fontSize: "4px" }}
            >
              {xLabel}
            </text>
          )}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted-foreground)]">
        {items.map((item) => (
          <span key={item.label}>
            {item.label}: {formatValue(item.value, unit)}
          </span>
        ))}
      </div>
    </div>
  );
}

function PieChartWidget({
  title,
  data,
  unit,
}: {
  title: string;
  data: string;
  unit?: string;
}) {
  const items = parseDataPairs(data);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (items.length === 0 || total === 0) {
    return (
      <div className="apple-card p-5 space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Pie chart
        </div>
        <div className="text-lg font-semibold">{title || "Pie chart"}</div>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Add data like Cats=4, Dogs=6.
        </p>
      </div>
    );
  }

  let start = 0;
  const segments = items.map((item, index) => {
    const ratio = item.value / total;
    const end = start + ratio * 360;
    const segment = `${chartColors[index % chartColors.length]} ${start}deg ${end}deg`;
    start = end;
    return segment;
  });

  return (
    <div className="apple-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Pie chart
      </div>
      <div className="text-lg font-semibold">{title || "Pie chart"}</div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative">
          <div
            className="h-32 w-32 rounded-full"
            style={{
              background: `conic-gradient(${segments.join(", ")})`,
            }}
          />
          <div className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-[color:var(--surface)] shadow-sm" />
        </div>
        <div className="space-y-2 text-sm">
          {items.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  background: chartColors[index % chartColors.length],
                }}
              />
              <span className="font-medium">{item.label}</span>
              <span className="apple-subtle">
                {formatValue(item.value, unit)}
              </span>
              <span className="apple-subtle">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumberLineWidget({
  min,
  max,
  step,
  highlight,
  label,
}: {
  min: number;
  max: number;
  step: number;
  highlight: number;
  label: string;
}) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin + 10;
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const ticksCount = Math.min(
    24,
    Math.floor((safeMax - safeMin) / safeStep) + 1
  );
  const ticks = Array.from({ length: ticksCount }, (_, index) => {
    return safeMin + index * safeStep;
  });
  const highlightValue = Number.isFinite(highlight) ? highlight : safeMin;
  const range = safeMax - safeMin || 1;
  const highlightPercent = ((highlightValue - safeMin) / range) * 100;

  return (
    <div className="apple-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Number line
      </div>
      <div className="text-lg font-semibold">{label || "Number line"}</div>
      <div className="relative h-12">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[color:var(--border)]" />
        {ticks.map((tick) => {
          const percent = ((tick - safeMin) / range) * 100;
          return (
            <div
              key={tick}
              className="absolute top-1/2 -translate-y-1/2 text-[11px] text-[color:var(--muted-foreground)]"
              style={{ left: `calc(${percent}% - 8px)` }}
            >
              <div className="h-3 w-[1px] bg-[color:var(--border)] mx-auto mb-1" />
              {tick}
            </div>
          );
        })}
        <div
          className="absolute -top-2 left-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${highlightPercent}%` }}
        >
          <div className="h-3 w-3 rounded-full bg-[color:var(--accent)] shadow" />
          <div className="text-xs text-[color:var(--foreground)] mt-1 font-semibold">
            {highlightValue}
          </div>
        </div>
      </div>
    </div>
  );
}

function FractionWidget({
  numerator,
  denominator,
  label,
}: {
  numerator: number;
  denominator: number;
  label: string;
}) {
  const safeDenominator = Math.max(1, Math.round(denominator));
  const safeNumerator = Math.min(
    safeDenominator,
    Math.max(0, Math.round(numerator))
  );
  const segments = Array.from({ length: safeDenominator }, (_, index) => index);

  return (
    <div className="apple-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Fraction
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="text-center">
          <div className="text-lg font-semibold">{safeNumerator}</div>
          <div className="h-[2px] w-12 bg-[color:var(--foreground)]" />
          <div className="text-lg font-semibold">{safeDenominator}</div>
        </div>
        <div className="flex gap-1">
          {segments.map((segment) => (
            <div
              key={segment}
              className="h-6 w-6 rounded border border-[color:var(--border)]"
              style={{
                background:
                  segment < safeNumerator
                    ? "var(--accent)"
                    : "var(--surface-muted)",
              }}
            />
          ))}
        </div>
        <div>
          <div className="text-lg font-semibold">
            {label || `${safeNumerator}/${safeDenominator}`}
          </div>
          <div className="apple-subtle">
            {safeNumerator} parts shaded out of {safeDenominator}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShapeWidget({
  shape,
  label,
  width,
  height,
}: {
  shape: string;
  label: string;
  width: number;
  height: number;
}) {
  const shapeLower = shape.toLowerCase();
  const safeWidth = Math.max(60, Math.min(180, width));
  const safeHeight = Math.max(40, Math.min(140, height));

  let shapeNode = (
    <div
      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] shadow-sm"
      style={{ width: safeWidth, height: safeHeight }}
    />
  );

  if (shapeLower === "circle") {
    const size = Math.min(safeWidth, safeHeight);
    shapeNode = (
      <div
        className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] shadow-sm"
        style={{ width: size, height: size }}
      />
    );
  } else if (shapeLower === "square") {
    const size = Math.min(safeWidth, safeHeight);
    shapeNode = (
      <div
        className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] shadow-sm"
        style={{ width: size, height: size }}
      />
    );
  } else if (shapeLower === "triangle") {
    shapeNode = (
      <div
        className="h-0 w-0"
        style={{
          borderLeft: `${safeWidth / 2}px solid transparent`,
          borderRight: `${safeWidth / 2}px solid transparent`,
          borderBottom: `${safeHeight}px solid var(--border)`,
        }}
      />
    );
  }

  return (
    <div className="apple-card p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Shape
      </div>
      <div className="flex flex-wrap items-center gap-5 mt-3">
        <div className="flex items-center justify-center">{shapeNode}</div>
        <div>
          <div className="text-lg font-semibold">
            {label || shape || "Shape"}
          </div>
          <div className="apple-subtle">
            {shape ? `Type: ${shape}` : "Choose a shape type."}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetBlock({ value }: { value: string }) {
  const config = parseWidget(value);
  const type = (config.type ?? "").toLowerCase();

  if (type === "clock") {
    return <ClockWidget time={config.time ?? ""} label={config.label ?? ""} />;
  }

  if (type === "bar") {
    return (
      <BarChartWidget
        title={config.title ?? ""}
        data={config.data ?? ""}
        yLabel={config.y_label ?? config.ylabel}
        xLabel={config.x_label ?? config.xlabel}
        yMin={toNumber(config.y_min ?? config.min, NaN)}
        yMax={toNumber(config.y_max ?? config.max, NaN)}
        unit={config.unit}
        showValues={toBoolean(config.show_values, true)}
      />
    );
  }

  if (type === "line") {
    return (
      <LineChartWidget
        title={config.title ?? ""}
        data={config.data ?? ""}
        yLabel={config.y_label ?? config.ylabel}
        xLabel={config.x_label ?? config.xlabel}
        yMin={toNumber(config.y_min ?? config.min, NaN)}
        yMax={toNumber(config.y_max ?? config.max, NaN)}
        unit={config.unit}
      />
    );
  }

  if (type === "pie") {
    return (
      <PieChartWidget
        title={config.title ?? ""}
        data={config.data ?? ""}
        unit={config.unit}
      />
    );
  }

  if (type === "numberline") {
    return (
      <NumberLineWidget
        min={toNumber(config.min, 0)}
        max={toNumber(config.max, 10)}
        step={toNumber(config.step, 1)}
        highlight={toNumber(config.highlight, 0)}
        label={config.label ?? "Number line"}
      />
    );
  }

  if (type === "fraction") {
    return (
      <FractionWidget
        numerator={toNumber(config.numerator, 1)}
        denominator={toNumber(config.denominator, 2)}
        label={config.label ?? ""}
      />
    );
  }

  if (type === "shape") {
    return (
      <ShapeWidget
        shape={config.shape ?? "rectangle"}
        label={config.label ?? ""}
        width={toNumber(config.width, 120)}
        height={toNumber(config.height, 80)}
      />
    );
  }

  return (
    <div className="apple-card p-5">
      <div className="text-sm text-slate-500">
        Unknown widget type. Try: clock, bar, line, pie, numberline, fraction,
        shape.
      </div>
    </div>
  );
}
