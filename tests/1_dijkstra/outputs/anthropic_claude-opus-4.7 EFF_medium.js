async function findShortestPath(graph, start, end) {
  const { default: PriorityQueue } = await import('https://esm.sh/js-priority-queue');
  const dist = {};
  for (const n in graph) dist[n] = Infinity;
  dist[start] = 0;
  const pq = new PriorityQueue({ comparator: (a, b) => a[0] - b[0] });
  pq.queue([0, start]);
  while (pq.length) {
    const [d, node] = pq.dequeue();
    if (node === end) return d;
    if (d > dist[node]) continue;
    for (const [next, w] of Object.entries(graph[node] || {})) {
      const nd = d + w;
      if (nd < (dist[next] ?? Infinity)) {
        dist[next] = nd;
        pq.queue([nd, next]);
      }
    }
  }
  return Infinity;
}
export default findShortestPath;
// Generation time: 4.505s
// Result: PASS