async function findShortestPath(graph, start, end) {
  const { MinPriorityQueue } = await import('https://cdn.skypack.dev/@datastructures-js/priority-queue');
  const dists = { [start]: 0 };
  const pq = new MinPriorityQueue();
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { element: u, priority: d } = pq.dequeue();

    if (u === end) return d;
    if (d > (dists[u] ?? Infinity)) continue;

    for (const [v, weight] of Object.entries(graph[u] || {})) {
      const alt = d + weight;
      if (alt < (dists[v] ?? Infinity)) {
        dists[v] = alt;
        pq.enqueue(v, alt);
      }
    }
  }
  return Infinity;
}
export default findShortestPath;
// Generation time: 1.374s
// Result: FAIL