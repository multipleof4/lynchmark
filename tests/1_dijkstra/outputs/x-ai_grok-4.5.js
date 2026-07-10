async function findShortestPath(graph, start, end) {
  const { default: PriorityQueue } = await import('https://esm.sh/js-priority-queue');
  const dist = {};
  for (const node of Object.keys(graph)) dist[node] = Infinity;
  dist[start] = 0;
  const pq = new PriorityQueue({ comparator: (a, b) => a[1] - b[1] });
  pq.queue([start, 0]);
  const visited = new Set();
  while (pq.length) {
    const [u, cost] = pq.dequeue();
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === end) return cost;
    for (const [v, weight] of Object.entries(graph[u] || {})) {
      const alt = cost + weight;
      if (alt < (dist[v] ?? Infinity)) {
        dist[v] = alt;
        pq.queue([v, alt]);
      }
    }
  }
  return Infinity;
}
export default findShortestPath;
// Generation time: 22.841s
// Result: PASS