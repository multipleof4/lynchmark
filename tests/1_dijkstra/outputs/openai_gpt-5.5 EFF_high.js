const loadPQ = (() => {
  let p;

  return () => p ||= import("https://esm.sh/js-priority-queue@0.1.5")
    .then(m => m.default?.default ?? m.default ?? m.PriorityQueue);
})();

async function findShortestPath(graph, start, end) {
  const PriorityQueue = await loadPQ();
  const dist = new Map([[start, 0]]);
  const q = new PriorityQueue({
    comparator: (a, b) => a.cost - b.cost
  });

  q.queue({ node: start, cost: 0 });

  while (q.length) {
    const { node, cost } = q.dequeue();

    if (cost > dist.get(node)) continue;
    if (node === end) return cost;

    for (const [next, rawWeight] of Object.entries(graph?.[node] ?? {})) {
      const weight = Number(rawWeight);

      if (!Number.isFinite(weight) || weight < 0) {
        throw new RangeError("Edge weights must be finite non-negative numbers");
      }

      const nextCost = cost + weight;

      if (nextCost < (dist.get(next) ?? Infinity)) {
        dist.set(next, nextCost);
        q.queue({ node: next, cost: nextCost });
      }
    }
  }

  return Infinity;
}
export default findShortestPath;
// Generation time: 55.807s
// Result: PASS