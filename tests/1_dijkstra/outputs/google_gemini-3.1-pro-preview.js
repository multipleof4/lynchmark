export const findShortestPath = async (g, s, e) => {
  const { default: PQ } = await import("https://esm.sh/js-priority-queue");
  const q = new PQ({ comparator: (a, b) => a[1] - b[1] });
  const d = { [s]: 0 };
  
  q.queue([s, 0]);
  
  while (q.length) {
    const [u, w] = q.dequeue();
    
    if (u === e) return w;
    if (w > d[u]) continue;
    
    for (const [v, c] of Object.entries(g[u] ?? {})) {
      const a = w + c;
      if (a < (d[v] ?? Infinity)) {
        d[v] = a;
        q.queue([v, a]);
      }
    }
  }
  
  return Infinity;
};
export default findShortestPath;
// Generation time: 19.792s
// Result: PASS