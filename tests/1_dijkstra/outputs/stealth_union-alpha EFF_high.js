async function findShortestPath(graph, start, end) {
  for (const edges of Object.values(graph))
    for (const weight of Object.values(edges))
      if (!Number.isFinite(weight) || weight < 0)
        throw new RangeError("Edge weights must be finite, nonnegative numbers.");

  if (!Object.hasOwn(graph, start) || !Object.hasOwn(graph, end))
    return Infinity;
  if (start === end) return 0;

  const { default: PriorityQueue } = await import(
    "https://esm.sh/js-priority-queue@0.1.5"
  );
  const queue = new PriorityQueue({ comparator: (a, b) => a[1] - b[1] });
  const distances = new Map([[start, 0]]);

  queue.queue([start, 0]);

  while (queue.length) {
    const [node, distance] = queue.dequeue();

    if (distance !== distances.get(node)) continue;
    if (node === end) return distance;

    for (const [neighbor, weight] of Object.entries(graph[node] ?? {})) {
      const next = distance + weight;

      if (next >= (distances.get(neighbor) ?? Infinity)) continue;
      distances.set(neighbor, next);
      queue.queue([neighbor, next]);
    }
  }

  return Infinity;
}
export default findShortestPath;
// Generation time: 66.902s
// Result: PASS