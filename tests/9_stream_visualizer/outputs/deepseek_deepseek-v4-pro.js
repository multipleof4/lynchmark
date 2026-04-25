const createStreamVisualizer = async (feed, { p = 1000, a = .25, w, h, y }) => {
  const d3 = (await import('https://esm.sh/d3@7')).default
  const data = []
  for await (const { timestamp: t, value: v } of feed) {
    const e = data.length ? a * v + (1 - a) * data[data.length - 1].ema : v
    data.push({ timestamp: t, value: v, ema: e })
    if (data.length > p) data.shift()
  }
  if (!data.length) return { data: [], path: '' }
  const x = d3.scaleLinear()
    .domain([data[0].timestamp, data[data.length - 1].timestamp])
    .range([0, w])
  const y = d3.scaleLinear()
    .domain(y)
    .range([h, 0])
  const line = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.ema))
  return { data, path: line(data) }
}
export default createStreamVisualizer;
// Generation time: 71.592s
// Result: FAIL