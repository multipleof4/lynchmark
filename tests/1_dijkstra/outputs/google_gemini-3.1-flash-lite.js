async function findShortestPath(graph, start, end) {
  const { PriorityQueue } = await import('https://cdn.skypack.dev/js-priority-queue');
  const dist = { [start]: 0 };
  const pq = new PriorityQueue({
    comparator: (a, b) => a.w - b.w
  });

  pq.queue({ n: start, w: 0 });

  while (pq.length) {
    const { n, w } = pq.dequeue();

    if (n === end) return w;
    if (w > (dist[n] ?? Infinity)) continue;

    for (const [neighbor, weight] of Object.entries(graph[n] || {})) {
      const newDist = w + weight;
      if (newDist < (dist[neighbor] ?? Infinity)) {
        dist[neighbor] = newDist;
        pq.queue({ n: neighbor, w: newDist });
      }
    }
  }

  return Infinity;
}
export default findShortestPath;
// Generation time: 1.539s
// Result: FAIL