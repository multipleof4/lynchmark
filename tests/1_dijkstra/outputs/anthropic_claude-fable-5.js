const findShortestPath = async (graph, start, end) => {
  const { default: PriorityQueue } = await import(
    'https://cdn.jsdelivr.net/npm/js-priority-queue@0.1.5/+esm'
  );
  const dist = { [start]: 0 };
  const pq = new PriorityQueue({ comparator: (a, b) => a[0] - b[0] });
  pq.queue([0, start]);
  while (pq.length) {
    const [d, node] = pq.dequeue();
    if (node === end) return d;
    if (d > (dist[node] ?? Infinity)) continue;
    for (const [next, w] of Object.entries(graph[node] ?? {})) {
      const nd = d + w;
      if (nd < (dist[next] ?? Infinity)) {
        dist[next] = nd;
        pq.queue([nd, next]);
      }
    }
  }
  return Infinity;
};
export default findShortestPath;
// Generation time: 12.985s
// Result: PASS