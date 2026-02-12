const findConvexHull = async points => {
  const { sortBy, uniqWith, isEqual } = await import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.js');

  if (points.length <= 2) return uniqWith(points, isEqual);

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const sorted = sortBy(points, ['x', 'y']);

  const build = pts => {
    const h = [];
    for (const p of pts) {
      while (h.length > 1 && cross(h.at(-2), h.at(-1), p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };

  const lower = build(sorted);
  const upper = build(sorted.reverse());

  lower.pop();
  upper.pop();

  return uniqWith([...lower, ...upper], isEqual);
};
export default findConvexHull;
// Generation time: 122.181s
// Result: PASS