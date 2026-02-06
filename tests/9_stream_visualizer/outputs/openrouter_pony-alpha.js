const createStreamVisualizer = async (iterable, { maxPoints, alpha, width, height, yDomain }) => {
  const d3 = await import('https://esm.sh/d3');
  const data = [];
  let ema;

  for await (const { timestamp, value } of iterable) {
    ema = ema == null ? value : alpha * value + (1 - alpha) * ema;
    data.push({ timestamp, value, ema });
    if (data.length > maxPoints) data.shift();
  }

  if (!data.length) return { data, path: '' };

  const x = d3.scaleLinear()
    .domain([data[0].timestamp, data.at(-1).timestamp])
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain(yDomain)
    .range([height, 0]);

  const path = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))
    (data);

  return { data, path };
};
export default createStreamVisualizer;
// Generation time: 253.115s
// Result: PASS