const findConvexHull = async points => {
  const { sortBy, uniqBy } = await import(
    "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.js"
  )

  const pts = uniqBy(
    sortBy(points, ["x", "y"]),
    p => `${p.x}\u0000${p.y}`
  )

  if (pts.length < 2) return pts

  const cross = (a, b, c) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)

  const half = arr => {
    const h = []

    for (const p of arr) {
      while (h.length > 1 && cross(h.at(-2), h.at(-1), p) <= 0) h.pop()
      h.push(p)
    }

    return h
  }

  return [
    ...half(pts).slice(0, -1),
    ...half([...pts].reverse()).slice(0, -1)
  ]
}
export default findConvexHull;
// Generation time: 14.673s
// Result: PASS