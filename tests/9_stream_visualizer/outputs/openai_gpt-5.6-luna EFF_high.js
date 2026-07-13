async function createStreamVisualizer(asyncIterable, options = {}) {
  const {
    maxPoints = 1000,
    alpha = 0.2,
    width = 800,
    height = 400,
    yDomain = [0, 1]
  } = options;

  if (
    !asyncIterable ||
    typeof asyncIterable[Symbol.asyncIterator] !== "function"
  ) {
    throw new TypeError("asyncIterable must be an async iterable");
  }

  if (!Number.isSafeInteger(maxPoints) || maxPoints < 1) {
    throw new RangeError("maxPoints must be a positive integer");
  }

  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError("alpha must be between 0 and 1");
  }

  if (
    !Number.isFinite(width) ||
    width < 0 ||
    !Number.isFinite(height) ||
    height < 0
  ) {
    throw new RangeError("width and height must be non-negative numbers");
  }

  const [yMin, yMax] = Array.isArray(yDomain) ? yDomain : [];

  if (
    !Number.isFinite(yMin) ||
    !Number.isFinite(yMax) ||
    yMin >= yMax
  ) {
    throw new RangeError("yDomain must contain two ascending finite numbers");
  }

  const { scaleLinear, line } = await import(
    "https://cdn.jsdelivr.net/npm/d3@7/+esm"
  );

  const data = [];
  let ema;

  for await (const point of asyncIterable) {
    if (!point || typeof point !== "object") {
      throw new TypeError("Each stream item must be an object");
    }

    const { timestamp, value } = point;

    if (!Number.isFinite(Number(timestamp))) {
      throw new TypeError("Each timestamp must be numeric or date-like");
    }

    if (!Number.isFinite(value)) {
      throw new TypeError("Each value must be a finite number");
    }

    ema = ema === undefined
      ? value
      : alpha * value + (1 - alpha) * ema;

    data.push({ timestamp, value, ema });

    if (data.length > maxPoints) {
      data.shift();
    }
  }

  if (!data.length) {
    return { data, path: "" };
  }

  const x = scaleLinear()
    .domain([data[0].timestamp, data[data.length - 1].timestamp])
    .range([0, width]);

  const y = scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  const path = line()
    .x(point => x(point.timestamp))
    .y(point => y(point.ema))(data);

  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 27.431s
// Result: PASS