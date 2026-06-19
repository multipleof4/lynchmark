const findShortestPath = async (graph, start, end) => {
  const {default: PQ} = await import('https://esm.sh/js-priority-queue');
  const dist = new Map([[start, 0]]);
  const pq = new PQ({comparator: (a, b) => a[1] - b[1]});
  pq.queue([start, 0]);
  while (pq.length) {
    const [u, d] = pq.dequeue();
    if (u === end) return d;
    if (d > (dist.get(u) ?? Infinity)) continue;
    for (const [v, w] of Object.entries(graph[u] || {})) {
      const nd = d + w;
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd);
        pq.queue([v, nd]);
      }
    }
  }
  return Infinity;
};
export default findShortestPath;
// Generation time: 42.886s
// Result: PASS