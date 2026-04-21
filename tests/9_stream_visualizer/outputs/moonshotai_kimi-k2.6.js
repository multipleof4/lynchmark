const createStreamVisualizer = async (stream, options = {}) => {
  const { scaleLinear, line } = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");
  const { maxPoints = 1e3, alpha = .2, width = 600, height = 400, yDomain } = options;
  const data = [];
  let ema;
  for await (const { timestamp, value } of stream) {
    ema = data.length ? alpha * value + (1 - alpha) * ema : value;
    data.push({ timestamp, value, ema });
    if (data.length > maxPoints) data.shift();
  }
  if (!data.length) return { data, path: "" };
  const x = scaleLinear().domain([data[0].timestamp, data.at(-1).timestamp]).range([0, width]);
  const y = scaleLinear().domain(yDomain).range([height, 0]);
  const path = line().x(d => x(d.timestamp)).y(d => y(d.ema))(data);
  return { data, path };
};
export default createStreamVisualizer;
// Generation time: 68.920s
// Result: PASS