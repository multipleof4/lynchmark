async function findConvexHull(points) {
  const _ = (await import("https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js")).default
    || await import("https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js");

  const unique = _.uniqWith(points, _.isEqual);
  const sorted = _.sortBy(unique, ["x", "y"]);

  if (sorted.length <= 1) return sorted;

  const cross = (O, A, B) =>
    (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);

  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }

  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }

  lower.pop();
  upper.pop();

  return lower.concat(upper);
}
export default findConvexHull;
// Generation time: 5.615s
// Result: PASS