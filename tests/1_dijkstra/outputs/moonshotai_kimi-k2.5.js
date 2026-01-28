const findShortestPath = async (g, s, e) => {
  const { default: Q } = await import('https://esm.sh/js-priority-queue');
  const d = {}, q = new Q({ comparator: (a, b) => a[0] - b[0] });
  
  for (const k in g) d[k] = 1/0;
  d[s] = 0;
  q.queue([0, s]);
  
  while (q.length) {
    const [c, u] = q.dequeue();
    if (u === e) return c;
    if (c > d[u]) continue;
    for (const v in g[u] || {}) {
      const t = c + g[u][v];
      if (t < d[v]) {
        d[v] = t;
        q.queue([t, v]);
      }
    }
  }
  
  return 1/0;
};
export default findShortestPath;
// Generation time: 56.044s
// Result: FAIL