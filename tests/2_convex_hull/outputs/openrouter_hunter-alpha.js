const findConvexHull = async points => {
  const _ = await import('https://unpkg.com/lodash@4.17.21/lodash.js');
  const sorted = _.uniqWith(_.sortBy(points, ['x', 'y']), _.isEqual);
  if (sorted.length <= 2) return sorted;
  
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  
  const lower = [];
  for (let i = 0; i < sorted.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], sorted[i]) <= 0) {
      lower.pop();
    }
    lower.push(sorted[i]);
  }
  
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], sorted[i]) <= 0) {
      upper.pop();
    }
    upper.push(sorted[i]);
  }
  
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
};
export default findConvexHull;
// Generation time: 17.814s
// Result: FAIL