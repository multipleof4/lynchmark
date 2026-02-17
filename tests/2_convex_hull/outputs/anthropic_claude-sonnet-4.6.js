async function findConvexHull(points) {
  const { default: _ } = await import("https://cdn.skypack.dev/lodash");

  const unique = _.uniqWith(points, _.isEqual);
  const sorted = _.sortBy(unique, ["x", "y"]);

  if (sorted.length < 3) return sorted;

  const cross = (o, a, b) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const buildHalf = (pts) =>
    pts.reduce((hull, p) => {
      while (hull.length >= 2 && cross(hull.at(-2), hull.at(-1), p) <= 0)
        hull.pop();
      return [...hull, p];
    }, []);

  const lower = buildHalf(sorted);
  const upper = buildHalf([...sorted].reverse());

  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
export default findConvexHull;
// Generation time: 3.848s
// Result: PASS