async function findShortestPath(graph, start, end) {
  const PriorityQueue = (await import('https://esm.sh/js-priority-queue@0.1.5')).default
  const dist = Object.fromEntries(Object.keys(graph).map(n => [n, Infinity]))
  const pq = new PriorityQueue({ comparator: (a, b) => a[1] - b[1] })
  dist[start] = 0
  pq.queue([start, 0])

  while (pq.length) {
    const [node, d] = pq.dequeue()
    if (node === end) return d
    if (d > dist[node]) continue

    for (const [neigh, w] of Object.entries(graph[node])) {
      const nd = d + w
      if (nd < dist[neigh]) {
        dist[neigh] = nd
        pq.queue([neigh, nd])
      }
    }
  }
  return Infinity
}
export default findShortestPath;
// Generation time: 35.807s
// Result: PASS