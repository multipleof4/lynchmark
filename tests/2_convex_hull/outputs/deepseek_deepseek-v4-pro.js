const findConvexHull = async (points) => {
  const _ = await import('https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js');
  const pts = _.sortBy(_.uniqWith(points, (a, b) => a.x === b.x && a.y === b.y), ['x', 'y']);
  const n = pts.length;
  if (n <= 2) return pts;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (let i = 0; i < n; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0)
      lower.pop();
    lower.push(pts[i]);
  }
  const upper = [];
  for (let i = n - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0)
      upper.pop();
    upper.push(pts[i]);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
};
export default findConvexHull;
// Generation time: 21.237s
// Result: FAIL