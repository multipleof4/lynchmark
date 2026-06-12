const findConvexHull = async points => {
  const { sortBy, uniqWith, isEqual } = await import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js');
  const pts = uniqWith(sortBy(points, ['x', 'y']), isEqual);
  if (pts.length < 3) return pts;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const build = list => {
    const hull = [];
    for (const p of list) {
      while (hull.length > 1 && cross(hull.at(-2), hull.at(-1), p) <= 0) hull.pop();
      hull.push(p);
    }
    return hull.slice(0, -1);
  };
  return [...build(pts), ...build([...pts].reverse())];
};
export default findConvexHull;
// Generation time: 14.047s
// Result: PASS