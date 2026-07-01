async function findConvexHull(points) {
  const { default: _ } = await import('https://cdn.jsdelivr.net/npm/lodash-es/lodash.js');

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const pts = _.sortBy(_.uniqWith(points, _.isEqual), ['x', 'y']);
  if (pts.length < 3) return pts;

  const build = (arr) => {
    const hull = [];
    for (const p of arr) {
      while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) hull.pop();
      hull.push(p);
    }
    return hull;
  };

  const lower = build(pts);
  const upper = build([...pts].reverse());

  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
export default findConvexHull;
// Generation time: 9.472s
// Result: PASS