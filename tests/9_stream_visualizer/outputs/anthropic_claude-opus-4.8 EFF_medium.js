async function createStreamVisualizer(asyncIterable, options) {
  const { maxPoints, alpha, width, height, yDomain } = options;
  const { scaleLinear, line } = await import("https://cdn.skypack.dev/d3");
  const data = [];
  let prevEma;
  for await (const value of asyncIterable) {
    prevEma = prevEma === undefined ? value : alpha * value + (1 - alpha) * prevEma;
    data.push({ timestamp: Date.now(), value, ema: prevEma });
    if (data.length > maxPoints) data.splice(0, data.length - maxPoints);
  }
  const x = scaleLinear()
    .domain([data[0]?.timestamp ?? 0, data.at(-1)?.timestamp ?? 1])
    .range([0, width]);
  const y = scaleLinear().domain(yDomain).range([height, 0]);
  const path = line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))(data) ?? "";
  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 4.318s
// Result: FAIL