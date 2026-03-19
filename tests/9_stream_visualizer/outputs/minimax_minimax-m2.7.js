async function createStreamVisualizer(asyncIterable, { maxPoints, alpha, width, height, yDomain }) {
  const data = [];
  let prevEma;
  let firstTs;
  let lastTs;
  for await (const { timestamp, value } of asyncIterable) {
    prevEma = prevEma === undefined ? value : alpha * value + (1 - alpha) * prevEma;
    const point = { timestamp, value, ema: prevEma };
    data.push(point);
    if (data.length > maxPoints) data.shift();
    lastTs = timestamp;
    if (!firstTs) firstTs = timestamp;
  }
  if (!data.length) return { data: [], path: '' };
  const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
  const xScale = d3.scaleLinear().domain([firstTs, lastTs]).range([0, width]);
  const yScale = d3.scaleLinear().domain(yDomain).range([height, 0]);
  const line = d3.line().x(d => xScale(d.timestamp)).y(d => yScale(d.ema)).curve(d3.curveMonotoneX);
  const path = line(data);
  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 51.428s
// Result: FAIL