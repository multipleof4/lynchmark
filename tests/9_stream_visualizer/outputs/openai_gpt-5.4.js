export async function createStreamVisualizer(asyncIterable, options = {}) {
  const {
    maxPoints = 500,
    alpha = 0.2,
    width = 800,
    height = 300,
    yDomain = [0, 1]
  } = options

  const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm')

  const cap = Math.max(1, maxPoints | 0)
  const a = Math.min(1, Math.max(0, Number(alpha)))
  const data = []
  let prevEma

  for await (const item of asyncIterable) {
    const timestamp = Number(item?.timestamp)
    const value = Number(item?.value)

    if (!Number.isFinite(timestamp) || !Number.isFinite(value)) continue

    prevEma = prevEma === undefined ? value : a * value + (1 - a) * prevEma
    data.push({ timestamp, value, ema: prevEma })

    if (data.length > cap) data.splice(0, data.length - cap)
  }

  if (!data.length) return { data, path: '' }

  const first = data[0].timestamp
  const last = data[data.length - 1].timestamp
  const x0 = first === last ? first - 1 : first
  const x1 = first === last ? last + 1 : last

  const x = d3.scaleLinear().domain([x0, x1]).range([0, width])
  const y = d3.scaleLinear().domain(yDomain).range([height, 0])

  const path =
    d3.line()
      .x(d => x(d.timestamp))
      .y(d => y(d.ema))(data) || ''

  return { data, path }
}
export default createStreamVisualizer;
// Generation time: 4.457s
// Result: PASS