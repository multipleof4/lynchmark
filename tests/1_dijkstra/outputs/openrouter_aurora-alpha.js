async function findShortestPath(g, s, t) {
  if (!(s in g) || !(t in g)) return Infinity;
  const { PriorityQueue } = await import('https://cdn.skypack.dev/js-priority-queue');
  const d = {}, v = new Set();
  for (const n in g) d[n] = Infinity;
  d[s] = 0;
  const q = new PriorityQueue({ comparator: (a, b) => a[0] - b[0] });
  q.queue([0, s]);
  while (q.length) {
    const [dist, u] = q.dequeue();
    if (v.has(u)) continue;
    if (u === t) return dist;
    v.add(u);
    for (const [nbr, w] of Object.entries(g[u])) {
      const nd = dist + w;
      if (nd < d[nbr]) {
        d[nbr] = nd;
        q.queue([nd, nbr]);
      }
    }
  }
  return Infinity;
}
export default findShortestPath;
// Generation time: 2.281s
// Result: FAIL