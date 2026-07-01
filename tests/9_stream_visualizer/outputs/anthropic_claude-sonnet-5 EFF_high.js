async function createStreamVisualizer(asyncIterable, options) {
  const { maxPoints, alpha, width, height, yDomain } = options;
  const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');

  const data = [];
  let prevEma;

  for await (const { timestamp, value } of asyncIterable) {
    prevEma = prevEma === undefined ? value : alpha * value + (1 - alpha) * prevEma;
    data.push({ timestamp, value, ema: prevEma });
    if (data.length > maxPoints) data.shift();
  }

  if (!data.length) return { data, path: '' };

  const x = d3.scaleLinear()
    .domain([data[0].timestamp, data[data.length - 1].timestamp])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(yDomain)
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema));

  return { data, path: line(data) };
}
export default createStreamVisualizer;
// Generation time: 5.834s
// Result: PASS