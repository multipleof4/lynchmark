const findConvexHull = async (pts) => {
  const _ = await import("https://esm.run/lodash");
  const p = _.uniqBy(_.sortBy(pts, ["x", "y"]), p => p.x + "," + p.y);
  if (p.length < 3) return p;

  const c = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const h = [];

  for (const pt of p) {
    while (h.length >= 2 && c(h.at(-2), h.at(-1), pt) <= 0) h.pop();
    h.push(pt);
  }

  const l = h.length + 1;
  for (let i = p.length - 2; i >= 0; i--) {
    while (h.length >= l && c(h.at(-2), h.at(-1), p[i]) <= 0) h.pop();
    h.push(p[i]);
  }

  h.pop();
  return h;
};
export default findConvexHull;
// Generation time: 35.612s
// Result: FAIL