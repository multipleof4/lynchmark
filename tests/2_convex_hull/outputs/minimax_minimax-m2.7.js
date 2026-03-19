async function findConvexHull(points) {
  const _ = await import('https://esm.sh/lodash@4');
  const pts = _.sortBy(_.uniqWith(points, _.isEqual), ['x', 'y']);
  if (pts.length <= 1) return pts;

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }

  const upper = [];
  for (const p of pts.slice().reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
export default findConvexHull;
// Generation time: 43.347s
// Result: PASS