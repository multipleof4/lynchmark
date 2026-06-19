async function findShortestPath(g, s, e) {
  const { default: PQ } = await import('https://esm.sh/js-priority-queue');
  const d = { [s]: 0 };
  const q = new PQ({ comparator: (a, b) => a.p - b.p });
  q.queue({ n: s, p: 0 });

  while (q.length) {
    const { n, p } = q.dequeue();
    if (n === e) return p;
    if (p > (d[n] ?? Infinity)) continue;

    for (const m in g[n]) {
      const w = p + g[n][m];
      if (w < (d[m] ?? Infinity)) {
        d[m] = w;
        q.queue({ n: m, p: w });
      }
    }
  }
  return Infinity;
}
export default findShortestPath;
// Generation time: 45.601s
// Result: PASS