async function createStreamVisualizer(it, { maxPoints, alpha, width, height, yDomain }) {
  const [{ scaleLinear, line, extent }] = await Promise.all([import('https://cdn.skypack.dev/d3')]);
  const data = [];
  let prevEma;

  for await (const { timestamp, value } of it) {
    prevEma = prevEma === undefined ? value : alpha * value + (1 - alpha) * prevEma;
    data.push({ timestamp, value, ema: prevEma });
    if (data.length > maxPoints) data.shift();
  }

  const x = scaleLinear().domain(extent(data, d => d.timestamp)).range([0, width]);
  const y = scaleLinear().domain(yDomain).range([height, 0]);
  const path = line().x(d => x(d.timestamp)).y(d => y(d.ema))(data);

  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 1.461s
// Result: PASS