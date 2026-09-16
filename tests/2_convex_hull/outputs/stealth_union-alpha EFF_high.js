async function findConvexHull(points) {
  if (!Array.isArray(points) || points.some(
    p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y)
  )) {
    throw new TypeError("Expected an array of points with finite numeric x and y.");
  }

  const { default: _ } = await import(
    "https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm"
  );
  const sorted = _.sortBy(
    _.uniqBy(points, p => JSON.stringify([p.x, p.y])),
    ["x", "y"]
  );

  if (sorted.length < 3) return sorted;

  const cross = (a, b, c) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

  const build = list => {
    const hull = [];
    for (const p of list) {
      while (
        hull.length > 1 &&
        cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0
      ) hull.pop();
      hull.push(p);
    }
    hull.pop();
    return hull;
  };

  return [...build(sorted), ...build([...sorted].reverse())];
}
export default findConvexHull;
// Generation time: 113.790s
// Result: PASS