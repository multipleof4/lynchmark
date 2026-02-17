const findShortestPath = async (graph, start, end) => {
  const { default: PriorityQueue } = await import(
    "https://cdn.jsdelivr.net/npm/js-priority-queue@0.1.5/priority-queue.js"
  );

  const pq = new PriorityQueue({ comparator: (a, b) => a[0] - b[0] });
  const dist = Object.fromEntries(Object.keys(graph).map((n) => [n, Infinity]));

  dist[start] = 0;
  pq.queue([0, start]);

  while (pq.length) {
    const [d, u] = pq.dequeue();

    if (d > dist[u]) continue;
    if (u === end) return d;

    for (const [v, w] of Object.entries(graph[u] ?? {})) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        pq.queue([nd, v]);
      }
    }
  }

  return dist[end];
};
export default findShortestPath;
// Generation time: 4.396s
// Result: FAIL