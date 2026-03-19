const findShortestPath = async (graph, start, end) => {
    const mod = await import('https://cdn.jsdelivr.net/npm/js-priority-queue@0.1.5/lib/priority-queue.js');
    const PriorityQueue = mod.default ?? mod.PriorityQueue ?? mod;
    const dist = {};
    for (const v of Object.keys(graph)) dist[v] = Infinity;
    const pq = new PriorityQueue({ comparator: (a, b) => a.dist - b.dist });
    pq.push({ node: start, dist: 0 });
    dist[start] = 0;
    while (pq.length) {
        const { node, dist: d } = pq.pop();
        if (node === end) return d;
        if (d > dist[node]) continue;
        for (const [n, w] of Object.entries(graph[node] ?? {})) {
            const nd = d + w;
            if (nd < (dist[n] ?? Infinity)) {
                dist[n] = nd;
                pq.push({ node: n, dist: nd });
            }
        }
    }
    return Infinity;
};
export default findShortestPath;
// Generation time: 66.576s
// Result: FAIL