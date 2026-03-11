async function createStreamVisualizer(asyncIterable, options) {
  const { maxPoints, alpha, width, height, yDomain } = options;
  const data = [];
  let ema;

  for await (const point of asyncIterable) {
    if (ema === undefined) {
      ema = point.value;
    } else {
      ema = alpha * point.value + (1 - alpha) * ema;
    }

    data.push({ timestamp: point.timestamp, value: point.value, ema });
    if (data.length > maxPoints) {
      data.shift();
    }
  }

  if (data.length === 0) {
    return { data, path: '' };
  }

  const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
  const xDomain = [data[0].timestamp, data[data.length - 1].timestamp];
  const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);
  const yScale = d3.scaleLinear().domain(yDomain).range([height, 0]);

  const lineGenerator = d3.line()
    .x(d => xScale(d.timestamp))
    .y(d => yScale(d.ema));

  return { data, path: lineGenerator(data) };
}
export default createStreamVisualizer;
// Generation time: 21.308s
// Result: PASS