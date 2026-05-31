async function findShortestPath(graph, start, end) {
  const { default: PriorityQueue } = await import("https://esm.sh/js-priority-queue");
  const dist = {};
  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;
  const pq = new PriorityQueue({ comparator: (a, b) => a.cost - b.cost });
  pq.queue({ node: start, cost: 0 });
  while (pq.length) {
    const { node, cost } = pq.dequeue();
    if (node === end) return cost;
    if (cost > dist[node]) continue;
    for (const next in graph[node]) {
      const nc = cost + graph[node][next];
      if (nc < dist[next]) {
        dist[next] = nc;
        pq.queue({ node: next, cost: nc });
      }
    }
  }
  return dist[end] ?? Infinity;
}
export default findShortestPath;
// Generation time: 5.506s
// Result: PASS