const createStreamVisualizer = async (stream, options) => {
  const { maxPoints, alpha, width, height, yDomain } = options;
  const mod = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
  const { scaleLinear, line } = mod.default || mod;

  const data = [];
  let prev;

  for await (const { timestamp, value } of stream) {
    const ema = prev === undefined ? value : alpha * value + (1 - alpha) * prev;
    prev = ema;
    data.push({ timestamp, value, ema });
    if (data.length > maxPoints) data.shift();
  }

  if (!data.length) return { data, path: '' };

  const x = scaleLinear()
    .domain([data[0].timestamp, data[data.length - 1].timestamp])
    .range([0, width]);

  const y = scaleLinear()
    .domain(yDomain)
    .range([height, 0]);

  const path = line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))(data) || '';

  return { data, path };
};
export default createStreamVisualizer;
// Generation time: 48.885s
// Result: PASS