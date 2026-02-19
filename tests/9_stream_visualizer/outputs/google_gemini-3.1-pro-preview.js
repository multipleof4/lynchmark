export const createStreamVisualizer = async (
  stream,
  { maxPoints, alpha, width, height, yDomain }
) => {
  const { scaleLinear, line } = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");
  const data = [];
  let ema;

  for await (const { timestamp, value } of stream) {
    ema = data.length ? alpha * value + (1 - alpha) * ema : value;
    data.push({ timestamp, value, ema });
    data.length > maxPoints && data.shift();
  }

  if (!data.length) return { data, path: "" };

  const x = scaleLinear([data[0].timestamp, data.at(-1).timestamp], [0, width]);
  const y = scaleLinear(yDomain, [height, 0]);

  return {
    data,
    path: line()
      .x(d => x(d.timestamp))
      .y(d => y(d.ema))(data)
  };
};
export default createStreamVisualizer;
// Generation time: 42.202s
// Result: PASS