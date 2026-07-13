let priorityQueueModule;

async function findShortestPath(graph, start, end) {
  if (!graph || typeof graph !== "object" || Array.isArray(graph)) {
    throw new TypeError("graph must be an object");
  }

  priorityQueueModule ??= import(
    "https://cdn.jsdelivr.net/npm/js-priority-queue@0.1.5/+esm"
  );

  const module = await priorityQueueModule;
  const PriorityQueue = module.default ?? module.PriorityQueue;

  if (typeof PriorityQueue !== "function") {
    throw new TypeError("PriorityQueue could not be loaded");
  }

  const queue = new PriorityQueue({
    comparator: (a, b) => a.distance - b.distance
  });
  const distances = new Map([[start, 0]]);

  queue.queue({ node: start, distance: 0 });

  while (queue.length) {
    const { node, distance } = queue.dequeue();

    if (distance !== distances.get(node)) continue;
    if (node === end) return distance;

    const edges = Object.hasOwn(graph, node) ? graph[node] : undefined;
    if (edges === undefined) continue;

    if (!edges || typeof edges !== "object" || Array.isArray(edges)) {
      throw new TypeError(`Invalid edges for node: ${node}`);
    }

    for (const [neighbor, weight] of Object.entries(edges)) {
      if (!Number.isFinite(weight) || weight < 0) {
        throw new RangeError("Edge weights must be finite and non-negative");
      }

      const nextDistance = distance + weight;

      if (nextDistance < (distances.get(neighbor) ?? Infinity)) {
        distances.set(neighbor, nextDistance);
        queue.queue({ node: neighbor, distance: nextDistance });
      }
    }
  }

  return Infinity;
}
export default findShortestPath;
// Generation time: 30.835s
// Result: PASS