async function createStreamVisualizer(s, {maxPoints: m, alpha: a, width: w, height: h, yDomain: [y0, y1]}) {
  const {scaleLinear, line} = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm")
  let d = [], e
  for await (const {timestamp: t, value: v} of s) {
    d.push({timestamp: t, value: v, ema: e = d.length ? a * v + (1 - a) * e : v})
    if (d.length > m) d.shift()
  }
  const x = scaleLinear([d[0].timestamp, d.at(-1).timestamp], [0, w]),
        y = scaleLinear([y0, y1], [h, 0])
  return {data: d, path: line().x(p => x(p.timestamp)).y(p => y(p.ema))(d)}
}
export default createStreamVisualizer;
// Generation time: 93.516s
// Result: PASS