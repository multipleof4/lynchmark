async function findConvexHull(points) {
  if (!Array.isArray(points) || points.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
    throw new TypeError('findConvexHull expects an array of finite {x, y} points');
  }

  const { sortBy, uniqWith } = await import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm');
  const ps = uniqWith(
    sortBy(points.map(({ x, y }) => ({ x, y })), ['x', 'y']),
    (a, b) => a.x === b.x && a.y === b.y
  );

  if (ps.length < 3) return ps;

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const half = q => {
    const h = [];
    for (const p of q) {
      while (h.length > 1 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };

  const lo = half(ps);
  const hi = half([...ps].reverse());

  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
}
export default findConvexHull;
// Generation time: 96.201s
// Result: PASS