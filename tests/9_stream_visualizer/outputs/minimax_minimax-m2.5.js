export async function createStreamVisualizer(asyncIterable, options) {
  const { maxPoints = 1000, alpha = 0.1, width = 800, height = 400, yDomain = [0, 100] } = options || {};
  const d3 = await import('d3');
  const data = [];
  let prevEma;
  for await (const { timestamp, value } of asyncIterable) {
    prevEma = prevEma === undefined ? value : alpha * value + (1 - alpha) * prevEma;
    data.push({ timestamp, value, ema: prevEma });
    if (data.length > maxPoints) data.shift();
  }
  if (!data.length) return { data: [], path: '' };
  const x = d3.scaleLinear().domain([data[0].timestamp, data[data.length - 1].timestamp]).range([0, width]);
  const y = d3.scaleLinear().domain(yDomain).range([height, 0]);
  const path = d3.line().x(d => x(d.timestamp)).y(d => y(d.ema))(data) || '';
  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 53.348s
// Result: FAIL