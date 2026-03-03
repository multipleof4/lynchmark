async function createStreamVisualizer(stream, { maxPoints, alpha, width, height, yDomain }) {
  const [{ scaleLinear, line, extent }] = await Promise.all([
    import('https://cdn.skypack.dev/d3@7'),
  ]);

  const data = [];
  let ema = null;

  for await (const { timestamp, value } of stream) {
    ema = ema === null ? value : alpha * value + (1 - alpha) * ema;
    data.push({ timestamp, value, ema });
    if (data.length > maxPoints) data.shift();
  }

  const xScale = scaleLinear()
    .domain(extent(data, (d) => d.timestamp))
    .range([0, width]);

  const yScale = scaleLinear()
    .domain(yDomain)
    .range([height, 0]);

  const path = line()
    .x((d) => xScale(d.timestamp))
    .y((d) => yScale(d.ema))(data);

  return { data, path };
}
export default createStreamVisualizer;
// Generation time: 1.712s
// Result: PASS