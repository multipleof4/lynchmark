async function createStreamVisualizer(asyncIterable, options = {}) {
  const { maxPoints, alpha, width, height, yDomain } = options;

  if (typeof asyncIterable?.[Symbol.asyncIterator] !== "function")
    throw new TypeError("Expected an async iterable.");

  if (!Number.isSafeInteger(maxPoints) || maxPoints < 1)
    throw new RangeError("maxPoints must be a positive safe integer.");

  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1)
    throw new RangeError("alpha must be between 0 and 1.");

  if (![width, height].every(n => Number.isFinite(n) && n >= 0))
    throw new RangeError("width and height must be finite and nonnegative.");

  if (
    !Array.isArray(yDomain) ||
    yDomain.length !== 2 ||
    !yDomain.every(Number.isFinite) ||
    yDomain[0] >= yDomain[1]
  )
    throw new RangeError("yDomain must contain two increasing finite numbers.");

  const domain = [...yDomain];
  const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm");
  const buffer = [];
  let cursor = 0, ema;

  for await (const point of asyncIterable) {
    const { timestamp, value } = point ?? {};
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;

    if (!Number.isFinite(time) || !Number.isFinite(value))
      throw new TypeError("Each point needs a valid timestamp and finite value.");

    ema = ema === undefined ? value : alpha * value + (1 - alpha) * ema;
    buffer[cursor] = { timestamp: time, value, ema };
    cursor = (cursor + 1) % maxPoints;
  }

  const data = buffer.length === maxPoints
    ? buffer.slice(cursor).concat(buffer.slice(0, cursor))
    : buffer;

  if (!data.length) return { data, path: "" };

  const x = d3.scaleLinear()
    .domain([data[0].timestamp, data[data.length - 1].timestamp])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(domain)
    .range([height, 0]);

  const path = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))(data) ?? "";

  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 101.222s
// Result: PASS