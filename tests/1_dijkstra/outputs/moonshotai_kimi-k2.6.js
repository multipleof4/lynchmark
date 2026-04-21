const findShortestPath = async (g, s, e) => {
  const { default: P } = await import('https://esm.sh/js-priority-queue');
  const q = new P({ comparator: (a, b) => a.d - b.d });
  const dist = { [s]: 0 };
  q.queue({ u: s, d: 0 });
  while (q.length) {
    const { u, d: du } = q.dequeue();
    if (du > dist[u]) continue;
    if (u === e) return du;
    for (const [v, w] of Object.entries(g[u] ?? {})) {
      const alt = du + w;
      if (alt < (dist[v] ?? Infinity)) {
        dist[v] = alt;
        q.queue({ u: v, d: alt });
      }
    }
  }
  return dist[e] ?? Infinity;
};
export default findShortestPath;
// Generation time: 152.935s
// Result: PASS