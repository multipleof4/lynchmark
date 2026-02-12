const createStreamVisualizer = async (iterable, { maxPoints, alpha, width, height, yDomain }) => {
  const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
  const data = [];
  let ema;

  for await (const { timestamp, value } of iterable) {
    ema = ema === undefined ? value : alpha * value + (1 - alpha) * ema;
    data.push({ timestamp, value, ema });
    if (data.length > maxPoints) data.shift();
  }

  const x = d3.scaleLinear().domain([data[0].timestamp, data.at(-1).timestamp]).range([0, width]);
  const y = d3.scaleLinear().domain(yDomain).range([height, 0]);

  return { data, path: d3.line().x(d => x(d.timestamp)).y(d => y(d.ema))(data) };
};
export default createStreamVisualizer;
// Generation time: 86.368s
// Result: PASS