export async function createStreamVisualizer(asyncIterable, options = {}) {
  const d3Promise = import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

  const cap = Math.max(0, Number.isFinite(+options.maxPoints) ? +options.maxPoints : 500);
  const a = Math.min(1, Math.max(0, Number.isFinite(+options.alpha) ? +options.alpha : 0.2));
  const width = Number.isFinite(+options.width) ? +options.width : 640;
  const height = Number.isFinite(+options.height) ? +options.height : 320;

  const yd = Array.isArray(options.yDomain) ? options.yDomain : [0, 1];
  const y0 = Number.isFinite(+yd[0]) ? +yd[0] : 0;
  const y1Raw = Number.isFinite(+yd[1]) ? +yd[1] : 1;
  const y1 = y1Raw === y0 ? y0 + 1 : y1Raw;

  const data = [];
  let ema;

  for await (const item of asyncIterable) {
    const rawValue = item && typeof item === "object" ? item.value : item;
    const rawTs = item && typeof item === "object" && "timestamp" in item ? item.timestamp : Date.now();

    const value = +rawValue;
    const ts = rawTs instanceof Date ? +rawTs : +rawTs;

    if (!Number.isFinite(value) || !Number.isFinite(ts)) continue;

    ema = ema === undefined ? value : a * value + (1 - a) * ema;

    if (cap) {
      data.push({ timestamp: ts, value, ema });
      if (data.length > cap) data.splice(0, data.length - cap);
    }
  }

  if (!data.length) return { data, path: "" };

  const { scaleLinear, line } = await d3Promise;

  const first = data[0].timestamp;
  const lastRaw = data[data.length - 1].timestamp;
  const last = lastRaw === first ? first + 1 : lastRaw;

  const x = scaleLinear().domain([first, last]).range([0, width]);
  const y = scaleLinear().domain([y0, y1]).range([height, 0]);

  const path = line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))(data) || "";

  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 20.596s
// Result: PASS