const findConvexHull = async (pts) => {
  const { sortBy, uniqBy } = await import("https://esm.sh/lodash-es@4.17.21"),
    u = uniqBy(pts, p => `${p.x},${p.y}`),
    s = sortBy(u, ["x", "y"]),
    n = s.length,
    c = (a, b, d) => (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x),
    l = [],
    h = [];
  if (n < 3) return s;
  for (let i = 0; i < n; i++) {
    const p = s[i];
    while (l.length > 1 && c(l[l.length - 2], l[l.length - 1], p) <= 0) l.pop();
    l.push(p);
  }
  for (let i = n; i--; ) {
    const p = s[i];
    while (h.length > 1 && c(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
    h.push(p);
  }
  return [...l.slice(0, -1), ...h.slice(0, -1)];
};
export default findConvexHull;
// Generation time: 116.732s
// Result: PASS