export async function findShortestPath(graph, start, end) {
  const { default: PriorityQueue } = await import('https://esm.sh/js-priority-queue@0.1.5');
  
  const dists = { [start]: 0 };
  const pq = new PriorityQueue({ comparator: (a, b) => a.dist - b.dist });
  
  pq.queue({ node: start, dist: 0 });

  while (pq.length) {
    const { node, dist } = pq.dequeue();

    if (node === end) return dist;
    if (dist > (dists[node] ?? Infinity)) continue;

    for (const [neighbor, weight] of Object.entries(graph[node] ?? {})) {
      const nextDist = dist + weight;
      if (nextDist < (dists[neighbor] ?? Infinity)) {
        dists[neighbor] = nextDist;
        pq.queue({ node: neighbor, dist: nextDist });
      }
    }
  }

  return Infinity;
}
export default findShortestPath;
// Generation time: 11.455s
// Result: PASS