async function createStreamVisualizer(asyncIterable, options) {
  const { maxPoints, alpha, width, height, yDomain } = options;
  const { scaleLinear, line } = await import("https://cdn.skypack.dev/d3");

  const data = [];
  let prevEma = null;

  for await (const { timestamp, value } of asyncIterable) {
    const ema = prevEma === null ? value : alpha * value + (1 - alpha) * prevEma;
    prevEma = ema;
    data.push({ timestamp, value, ema });
    if (data.length > maxPoints) data.shift();
  }

  const xScale = scaleLinear()
    .domain([data[0].timestamp, data[data.length - 1].timestamp])
    .range([0, width]);

  const yScale = scaleLinear()
    .domain(yDomain)
    .range([height, 0]);

  const path = line()
    .x(d => xScale(d.timestamp))
    .y(d => yScale(d.ema))(data);

  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 3.557s
// Result: PASS