async function findShortestPath(graph, start, end) {
  if (!(start in graph) || !(end in graph)) return Infinity;
  if (start === end) return 0;

  const { default: PriorityQueue } = await import('https://cdn.skypack.dev/js-priority-queue');

  const pq = new PriorityQueue({ comparator: (a, b) => a.w - b.w });
  const dist = {};

  for (const n in graph) dist[n] = Infinity;
  dist[start] = 0;
  pq.queue({ n: start, w: 0 });

  while (pq.length) {
    const { n, w } = pq.dequeue();
    if (w !== dist[n]) continue;
    if (n === end) return w;

    for (const [nb, wgt] of Object.entries(graph[n] || {})) {
      const ndist = w + wgt;
      if (ndist < dist[nb]) {
        dist[nb] = ndist;
        pq.queue({ n: nb, w: ndist });
      }
    }
  }

  return Infinity;
}
export default findShortestPath;
// Generation time: 64.656s
// Result: PASS