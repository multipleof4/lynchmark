async function findShortestPath(graph, start, end) {
  if (!graph || !(start in graph) || !(end in graph)) return Infinity
  if (start === end) return 0

  const { default: PriorityQueue } = await import('https://cdn.jsdelivr.net/npm/js-priority-queue@0.1.5/+esm')
  const dist = Object.create(null)
  const seen = new Set()
  const pq = new PriorityQueue({ comparator: (a, b) => a[0] - b[0] })

  for (const node in graph) dist[node] = Infinity
  dist[start] = 0
  pq.queue([0, start])

  while (pq.length) {
    const [d, node] = pq.dequeue()
    if (seen.has(node)) continue
    if (node === end) return d
    seen.add(node)

    const neighbors = graph[node]
    for (const next in neighbors) {
      if (seen.has(next)) continue
      const nd = d + neighbors[next]
      if (nd < (dist[next] ?? Infinity)) {
        dist[next] = nd
        pq.queue([nd, next])
      }
    }
  }

  return Infinity
}
export default findShortestPath;
// Generation time: 3.635s
// Result: PASS