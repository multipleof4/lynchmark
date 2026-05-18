async function findConvexHull(pts) {
  const { sortBy, uniqWith, isEqual } = await import('https://cdn.skypack.dev/lodash');
  
  const sorted = sortBy(uniqWith(pts, isEqual), ['x', 'y']);
  if (sorted.length <= 2) return sorted;

  const crossProduct = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

  const build = (arr) => {
    const hull = [];
    for (const p of arr) {
      while (hull.length >= 2 && crossProduct(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
        hull.pop();
      }
      hull.push(p);
    }
    return hull;
  };

  const lower = build(sorted);
  const upper = build([...sorted].reverse());

  lower.pop();
  upper.pop();
  
  return lower.concat(upper);
}
export default findConvexHull;
// Generation time: 1.515s
// Result: PASS