export async function createStreamVisualizer(asyncIterable, options) {
  const {maxPoints, alpha, width, height, yDomain} = options;
  const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
  let data = [];
  let prevEma = null;
  for await (const v of asyncIterable) {
    const ts = v.timestamp || Date.now();
    const val = v.value;
    if (prevEma === null) prevEma = val;
    const ema = alpha * val + (1 - alpha) * prevEma;
    prevEma = ema;
    data.push({timestamp: ts, value: val, ema});
    if (data.length > maxPoints) data.shift();
  }
  if (!data.length) return {data: [], path: ''};
  const x = d3.scaleLinear()
    .domain([data[0].timestamp, data[data.length - 1].timestamp])
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain(yDomain)
    .range([height, 0]);
  const line = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema));
  const path = line(data);
  return {data, path};
}
export default createStreamVisualizer;
// Generation time: 1.550s
// Result: PASS