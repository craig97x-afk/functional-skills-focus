type WidgetConfig = Record<string, string>;

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
      <div className="flex items-center gap-5 mt-3">
        <div className="relative h-24 w-24 rounded-full border border-slate-200 bg-white shadow-sm">
          <div
            className="absolute left-1/2 top-1/2 h-8 w-[2px] bg-slate-700"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
              transformOrigin: "bottom center",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-10 w-[2px] bg-slate-900"
            style={{
              transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
              transformOrigin: "bottom center",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900" />
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
        Graph
      </div>
      <div className="text-lg font-semibold">{title || "Bar chart"}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="space-y-1">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{item.label}</span>
              <span className="apple-subtle">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-slate-500">
            Add data like Apples=5, Bananas=3.
          </div>
        )}
      </div>
    </div>
  );
}

function ShapeWidget({ shape, label }: { shape: string; label: string }) {
  const shapeLower = shape.toLowerCase();

  let shapeNode = (
    <div className="h-20 w-28 rounded-lg border border-slate-300 bg-white shadow-sm" />
  );

  if (shapeLower === "circle") {
    shapeNode = (
      <div className="h-20 w-20 rounded-full border border-slate-300 bg-white shadow-sm" />
    );
  } else if (shapeLower === "square") {
    shapeNode = (
      <div className="h-20 w-20 rounded-lg border border-slate-300 bg-white shadow-sm" />
    );
  } else if (shapeLower === "triangle") {
    shapeNode = (
      <div className="h-0 w-0 border-l-[48px] border-r-[48px] border-b-[80px] border-l-transparent border-r-transparent border-b-slate-300" />
    );
  }

  return (
    <div className="apple-card p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Shape
      </div>
      <div className="flex items-center gap-5 mt-3">
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

  if (type === "shape") {
    return (
      <ShapeWidget shape={config.shape ?? "rectangle"} label={config.label ?? ""} />
    );
  }

  return (
    <div className="apple-card p-5">
      <div className="text-sm text-slate-500">
        Unknown widget type. Use type: clock, bar, or shape.
      </div>
    </div>
  );
}
