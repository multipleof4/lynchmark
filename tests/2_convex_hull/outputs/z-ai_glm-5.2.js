async function findConvexHull(points) {
  const _ = await import('https://esm.sh/lodash');
  if (points.length < 3) return _.uniqWith(points, _.isEqual);

  const pts = _.sortBy(points, ['x', 'y']);
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  
  const build = (arr) => {
    const h = [];
    for (const p of arr) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };

  const lower = build(pts);
  const upper = build([...pts].reverse());
  
  return _.uniqWith([...lower, ...upper], _.isEqual);
}
export default findConvexHull;
// Generation time: 54.184s
// Result: PASS