async function createStreamVisualizer(src, { maxPoints, alpha, width, height, yDomain }) {
  const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
  const data = [];
  let ema;
  for await (const { timestamp, value } of src) {
    ema = ema === undefined ? value : alpha * value + (1 - alpha) * ema;
    data.push({ timestamp, value, ema });
    if (data.length > maxPoints) data.shift();
  }
  const x = d3.scaleLinear()
    .domain(data.length ? [data[0].timestamp, data[data.length - 1].timestamp] : [0, 1])
    .range([0, width]);
  const y = d3.scaleLinear().domain(yDomain).range([height, 0]);
  const path = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))(data) ?? '';
  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 6.412s
// Result: PASS