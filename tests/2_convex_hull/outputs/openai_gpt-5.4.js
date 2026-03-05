export async function findConvexHull(points) {
  if (!Array.isArray(points)) throw new TypeError('Expected an array of points')

  const { sortBy, uniqBy } = await import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.js')

  const pts = uniqBy(
    points
      .filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y))
      .map(({ x, y }) => ({ x, y })),
    p => `${p.x},${p.y}`
  )

  if (pts.length <= 1) return pts.slice()

  const sorted = sortBy(pts, ['x', 'y'])
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

  const lower = []
  for (const p of sorted) {
    while (lower.length > 1 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop()
    lower.push(p)
  }

  const upper = []
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]
    while (upper.length > 1 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop()
    upper.push(p)
  }

  lower.pop()
  upper.pop()

  return lower.concat(upper)
}
export default findConvexHull;
// Generation time: 4.241s
// Result: PASS