let l;

export const findConvexHull = async p => {
  if (!Array.isArray(p)) throw new TypeError("points must be an array");
  if (p.length < 2) return [...p];

  l = l || import("https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm");
  const { sortBy: m, uniqWith: u } = await l;

  const q = u(m(p, [o => o.x, o => o.y]), (a, b) => a.x === b.x && a.y === b.y);
  const n = q.length;
  if (n < 4) return q;

  const c = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const h = [];

  for (let i = 0; i < n; h.push(q[i++]))
    while (h.length > 1 && c(h[h.length - 2], h[h.length - 1], q[i]) <= 0) h.pop();

  const t = h.length + 1;
  for (let i = n - 1; i >= 0; h.push(q[i--]))
    while (h.length > t && c(h[h.length - 2], h[h.length - 1], q[i]) <= 0) h.pop();

  h.pop();
  return h;
};
export default findConvexHull;
// Generation time: 26.432s
// Result: FAIL