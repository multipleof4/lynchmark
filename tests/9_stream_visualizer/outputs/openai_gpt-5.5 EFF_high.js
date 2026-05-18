const d3$ = import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

async function createStreamVisualizer(asyncIterable, options = {}) {
  const {
    maxPoints,
    alpha,
    width,
    height,
    yDomain
  } = options;

  if (!asyncIterable?.[Symbol.asyncIterator])
    throw new TypeError("asyncIterable must be an async iterable");

  if (!Number.isInteger(maxPoints) || maxPoints < 1)
    throw new RangeError("maxPoints must be a positive integer");

  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1)
    throw new RangeError("alpha must be between 0 and 1");

  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0)
    throw new RangeError("width and height must be positive numbers");

  if (!Array.isArray(yDomain) || yDomain.length !== 2)
    throw new TypeError("yDomain must be [min, max]");

  const [yMin, yMax] = yDomain.map(Number);

  if (!Number.isFinite(yMin) || !Number.isFinite(yMax) || yMin === yMax)
    throw new RangeError("yDomain values must be finite and distinct");

  const d3 = await d3$;
  const data = [];
  let ema;

  for await (const item of asyncIterable) {
    const source = Array.isArray(item)
      ? { timestamp: item[0], value: item[1] }
      : item;

    const timestamp = +source?.timestamp;
    const value = +source?.value;

    if (!Number.isFinite(timestamp) || !Number.isFinite(value))
      throw new TypeError("stream items must include finite timestamp and value");

    ema = ema === undefined
      ? value
      : alpha * value + (1 - alpha) * ema;

    data.push({ timestamp, value, ema });

    if (data.length > maxPoints)
      data.splice(0, data.length - maxPoints);
  }

  if (!data.length)
    return { data, path: "" };

  const x = d3.scaleLinear()
    .domain([data[0].timestamp, data.at(-1).timestamp])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  const path = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))(data) || "";

  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 27.168s
// Result: PASS