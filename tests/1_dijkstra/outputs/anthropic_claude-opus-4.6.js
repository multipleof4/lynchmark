async function findShortestPath(graph, start, end) {
  const { default: PriorityQueue } = await import(
    "https://cdn.jsdelivr.net/npm/js-priority-queue@0.4.1/+esm"
  );

  const dist = {};
  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;

  const pq = new PriorityQueue({ comparator: (a, b) => a[1] - b[1] });
  pq.queue([start, 0]);

  const visited = new Set();

  while (pq.length > 0) {
    const [node, d] = pq.dequeue();

    if (node === end) return d;
    if (visited.has(node)) continue;
    visited.add(node);

    if (!graph[node]) continue;

    for (const [neighbor, weight] of Object.entries(graph[node])) {
      const nd = d + weight;
      if (nd < dist[neighbor]) {
        dist[neighbor] = nd;
        pq.queue([neighbor, nd]);
      }
    }
  }

  return dist[end] ?? Infinity;
}
export default findShortestPath;
// Generation time: 5.097s
// Result: FAIL