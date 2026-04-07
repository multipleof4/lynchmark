async function findShortestPath(g, s, e) {
  const { default: PQ } = await import('https://cdn.jsdelivr.net/npm/js-priority-queue/+esm');
  const q = new PQ({ comparator: (a, b) => a[1] - b[1] });
  const d = { [s]: 0 };
  q.queue([s, 0]);
  while (q.length) {
    const [n, c] = q.dequeue();
    if (n === e) return c;
    if (c > (d[n] ?? 1/0)) continue;
    for (const nb in g[n] || {}) {
      const nd = c + g[n][nb];
      if (nd < (d[nb] ?? 1/0)) {
        d[nb] = nd;
        q.queue([nb, nd]);
      }
    }
  }
  return d[e] ?? 1/0;
}
export default findShortestPath;
// Generation time: 39.949s
// Result: PASS