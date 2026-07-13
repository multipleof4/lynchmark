async function findConvexHull(points) {
  if (!Array.isArray(points)) {
    throw new TypeError("Points must be an array");
  }

  if (points.some(point =>
    !point ||
    typeof point !== "object" ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y)
  )) {
    throw new TypeError("Each point must contain finite numeric x and y values");
  }

  const { sortBy, uniqBy } = await import(
    "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.js"
  );

  const sorted = sortBy(
    uniqBy(points, ({ x, y }) => `${x}\0${y}`),
    ["x", "y"]
  );

  if (sorted.length < 3) {
    return sorted;
  }

  const cross = (a, b, c) =>
    (b.x - a.x) * (c.y - a.y) -
    (b.y - a.y) * (c.x - a.x);

  const buildHalf = sequence => {
    const half = [];

    for (const point of sequence) {
      while (
        half.length > 1 &&
        cross(half[half.length - 2], half[half.length - 1], point) <= 0
      ) {
        half.pop();
      }

      half.push(point);
    }

    return half;
  };

  const lower = buildHalf(sorted);
  const upper = buildHalf(sorted.slice().reverse());

  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
export default findConvexHull;
// Generation time: 21.094s
// Result: PASS