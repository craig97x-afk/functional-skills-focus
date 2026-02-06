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
      <div className="flex flex-wrap items-center gap-5 mt-3">
        <div className="relative h-28 w-28 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] shadow-sm">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 h-2 w-[2px] bg-[color:var(--muted-foreground)]"
              style={{
                transform: `translate(-50%, -100%) rotate(${index * 30}deg)`,
                transformOrigin: "bottom center",
              }}
            />
          ))}
          <div
            className="absolute left-1/2 top-1/2 h-9 w-[2px] bg-[color:var(--foreground)]"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
              transformOrigin: "bottom center",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-12 w-[2px] bg-[color:var(--accent)]"
            style={{
              transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
              transformOrigin: "bottom center",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--foreground)]" />
        </div>
        <div>
          <div className="text-lg font-semibold">{label || time}</div>
          <div className="apple-subtle">Time shown: {time || "--:--"}</div>
        </div>
      </div>
    </div>
  );
}

function BarChartWidget({ title, data }: { title: string; data: string }) {
  const items = parseDataPairs(data);
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="apple-card p-5 space-y-3">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Bar chart
      </div>
      <div className="text-lg font-semibold">{title || "Bar chart"}</div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.label}-${item.value}`} className="space-y-1">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{item.label}</span>
              <span className="apple-subtle">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-[color:var(--surface-muted)]">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: chartColors[index % chartColors.length],
                }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-[color:var(--muted-foreground)]">
            Add data like Apples=5, Bananas=3.
          </div>
        )}
      </div>
    </div>
  );
}

function LineChartWidget({ title, data }: { title: string; data: string }) {
  const items = parseDataPairs(data);
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const minValue = Math.min(...items.map((i) => i.value), 0);

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

  const points = items
    .map((item, index) => {
      const x = (index / (items.length - 1)) * 100;
      const y =
        100 - ((item.value - minValue) / (maxValue - minValue || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="apple-card p-5 space-y-3">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Line graph
      </div>
      <div className="text-lg font-semibold">{title || "Line graph"}</div>
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
        <svg viewBox="0 0 100 100" className="h-36 w-full">
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            points={points}
          />
          {items.map((item, index) => {
            const x = (index / (items.length - 1)) * 100;
            const y =
              100 -
              ((item.value - minValue) / (maxValue - minValue || 1)) * 100;
            return (
              <circle
                key={`${item.label}-${index}`}
                cx={x}
                cy={y}
                r="2.5"
                fill="var(--foreground)"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted-foreground)]">
        {items.map((item) => (
          <span key={item.label}>
            {item.label}: {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function PieChartWidget({ title, data }: { title: string; data: string }) {
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
    <div className="apple-card p-5 space-y-3">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Pie chart
      </div>
      <div className="text-lg font-semibold">{title || "Pie chart"}</div>
      <div className="flex flex-wrap items-center gap-6">
        <div
          className="h-32 w-32 rounded-full"
          style={{
            background: `conic-gradient(${segments.join(", ")})`,
          }}
        />
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
              <span className="apple-subtle">{item.value}</span>
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
    <div className="apple-card p-5 space-y-3">
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
          className="absolute -top-1 left-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${highlightPercent}%` }}
        >
          <div className="h-3 w-3 rounded-full bg-[color:var(--accent)]" />
          <div className="text-xs text-[color:var(--foreground)] mt-1">
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
      <BarChartWidget title={config.title ?? ""} data={config.data ?? ""} />
    );
  }

  if (type === "line") {
    return (
      <LineChartWidget title={config.title ?? ""} data={config.data ?? ""} />
    );
  }

  if (type === "pie") {
    return (
      <PieChartWidget title={config.title ?? ""} data={config.data ?? ""} />
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
        Unknown widget type. Try: clock, bar, line, pie, numberline, fraction, shape.
      </div>
    </div>
  );
}
