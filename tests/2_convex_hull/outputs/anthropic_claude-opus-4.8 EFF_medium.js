const findConvexHull = async (points) => {
  const { default: _ } = await import("https://cdn.skypack.dev/lodash");

  const pts = _.sortBy(
    _.uniqBy(points, (p) => `${p.x},${p.y}`),
    ["x", "y"]
  );

  if (pts.length < 3) return pts;

  const cross = (o, a, b) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const build = (arr) => {
    const h = [];
    for (const p of arr) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0)
        h.pop();
      h.push(p);
    }
    h.pop();
    return h;
  };

  return [...build(pts), ...build([...pts].reverse())];
};
export default findConvexHull;
// Generation time: 4.735s
// Result: PASS