async function findShortestPath(graph, start, end) {
  const { default: PriorityQueue } = await import('https://esm.sh/js-priority-queue@0.1.5');

  if (!(start in graph) || !(end in graph)) return Infinity;

  const dist = Object.fromEntries(Object.keys(graph).map(n => [n, Infinity]));
  dist[start] = 0;

  const pq = new PriorityQueue({ comparator: (a, b) => a.dist - b.dist });
  pq.queue({ node: start, dist: 0 });

  const visited = new Set();

  while (pq.length > 0) {
    const { node, dist: d } = pq.dequeue();
    if (visited.has(node)) continue;
    visited.add(node);

    if (node === end) return d;

    for (const [neighbor, weight] of Object.entries(graph[node] ?? {})) {
      const newDist = d + weight;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        pq.queue({ node: neighbor, dist: newDist });
      }
    }
  }

  return dist[end];
}
export default findShortestPath;
// Generation time: 10.596s
// Result: PASS