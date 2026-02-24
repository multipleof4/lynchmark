const loadPriorityQueue = (() => {
  let p;
  return () =>
    p ??= import("https://esm.sh/js-priority-queue").then(m => m.default || m);
})();

async function findShortestPath(graph, start, end) {
  if (start === end) return 0;
  if (!graph || typeof graph !== "object") return Infinity;

  const PriorityQueue = await loadPriorityQueue();
  const dist = { [start]: 0 };
  const seen = new Set();
  const q = new PriorityQueue({ comparator: (a, b) => a[1] - b[1] });

  q.queue([start, 0]);

  while (q.length) {
    const [node, d] = q.dequeue();
    if (seen.has(node)) continue;
    seen.add(node);
    if (node === end) return d;

    const next = graph[node];
    if (!next || typeof next !== "object") continue;

    for (const n in next) {
      const w = next[n];
      if (!Number.isFinite(w) || w < 0) continue;
      const nd = d + w;
      if (nd < (dist[n] ?? Infinity)) {
        dist[n] = nd;
        q.queue([n, nd]);
      }
    }
  }

  return Infinity;
}
export default findShortestPath;
// Generation time: 15.189s
// Result: PASS