const findShortestPath = async (graph, start, end) => {
  const { default: PriorityQueue } = await import('https://esm.sh/js-priority-queue');
  const dist = { [start]: 0 };
  const pq = new PriorityQueue({ comparator: (a, b) => a.w - b.w });
  pq.queue({ v: start, w: 0 });

  while (pq.length) {
    const { v, w } = pq.dequeue();
    if (v === end) return w;
    if (w > (dist[v] ?? Infinity)) continue;

    const edges = graph[v] || {};
    for (const n in edges) {
      const nd = w + edges[n];
      if (nd < (dist[n] ?? Infinity)) {
        dist[n] = nd;
        pq.queue({ v: n, w: nd });
      }
    }
  }
  return Infinity;
};
export default findShortestPath;
// Generation time: 136.164s
// Result: PASS