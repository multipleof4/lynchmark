async function createStreamVisualizer(asyncIterable, { maxPoints: max, alpha, width: w, height: h, yDomain }) {
  const d3 = await import('d3');
  const data = [];
  let prev;

  for await (const { timestamp: t, value: v } of asyncIterable) {
    const ema = prev === undefined ? v : alpha * v + (1 - alpha) * prev;
    prev = ema;
    data.push({ timestamp: t, value: v, ema });
    if (data.length > max) data.shift();
  }

  if (!data.length) return { data, path: null };

  const x = d3.scaleLinear([data[0].timestamp, data[data.length - 1].timestamp], [0, w]);
  const y = d3.scaleLinear(yDomain, [h, 0]);

  const path = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))(data);

  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 17.130s
// Result: FAIL