let pqLib;

const loadPriorityQueue = () =>
  pqLib ??= import('https://esm.sh/js-priority-queue@0.1.5')
    .catch(() => import('https://cdn.jsdelivr.net/npm/js-priority-queue@0.1.5/+esm'));

async function findShortestPath(graph, start, end) {
  const { default: PriorityQueue } = await loadPriorityQueue();
  const dist = new Map([[start, 0]]);
  const heap = new PriorityQueue({ comparator: (a, b) => a[1] - b[1] });
  heap.queue([start, 0]);

  while (heap.length) {
    const [node, d] = heap.dequeue();
    if (node === end) return d;
    if (d > (dist.get(node) ?? Infinity)) continue;
    for (const [next, w] of Object.entries(graph[node] ?? {})) {
      const nd = d + w;
      if (nd < (dist.get(next) ?? Infinity)) {
        dist.set(next, nd);
        heap.queue([next, nd]);
      }
    }
  }
  return Infinity;
}
export default findShortestPath;
// Generation time: 122.554s
// Result: PASS