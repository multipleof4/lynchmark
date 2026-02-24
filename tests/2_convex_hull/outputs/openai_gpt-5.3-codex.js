async function findConvexHull(points = []) {
  if (!Array.isArray(points)) throw new TypeError("Expected an array of points");

  const { sortBy, uniqBy } = await import("https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.js");

  const pts = uniqBy(
    sortBy(
      points.filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y)),
      ["x", "y"]
    ),
    p => `${p.x},${p.y}`
  );

  const n = pts.length;
  if (n < 2) return pts.slice();

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }

  const upper = [];
  for (let i = n - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }

  lower.pop();
  upper.pop();

  return lower.concat(upper);
}
export default findConvexHull;
// Generation time: 16.419s
// Result: PASS