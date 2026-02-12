async function findShortestPath(graph, start, end) {
  const { default: PQ } = await import('https://cdn.skypack.dev/js-priority-queue');
  const dist = { [start]: 0 };
  const pq = new PQ({ comparator: (a, b) => a.w - b.w });
  pq.queue({ v: start, w: 0 });

  while (pq.length) {
    const { v, w } = pq.dequeue();
    if (v === end) return w;
    if (w > (dist[v] ?? Infinity)) continue;

    for (const n in graph[v]) {
      const d = w + graph[v][n];
      if (d < (dist[n] ?? Infinity)) {
        dist[n] = d;
        pq.queue({ v: n, w: d });
      }
    }
  }
  return Infinity;
}
export default findShortestPath;
// Generation time: 31.439s
// Result: PASS