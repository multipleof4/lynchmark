async function computeMST(tomlStr) {
  const [{ parse }, { Heap }, textTable] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml@1/dist/index.mjs'),
    import('https://cdn.jsdelivr.net/npm/mnemonist@0.39.8/+esm'),
    import('https://cdn.jsdelivr.net/npm/text-table@0.2.0/+esm')
  ]);

  const { edges } = parse(tomlStr);
  
  const nodes = new Set();
  edges.forEach(({ from, to }) => {
    nodes.add(from);
    nodes.add(to);
  });

  const parent = {};
  const rank = {};
  nodes.forEach(n => {
    parent[n] = n;
    rank[n] = 0;
  });

  const find = x => {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };

  const union = (x, y) => {
    const rx = find(x);
    const ry = find(y);
    if (rx === ry) return false;
    if (rank[rx] < rank[ry]) {
      parent[rx] = ry;
    } else if (rank[rx] > rank[ry]) {
      parent[ry] = rx;
    } else {
      parent[ry] = rx;
      rank[rx]++;
    }
    return true;
  };

  const heap = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => heap.push(e));

  const mst = [];
  let totalWeight = 0;
  const targetSize = nodes.size - 1;

  while (mst.length < targetSize && heap.size > 0) {
    const edge = heap.pop();
    if (union(edge.from, edge.to)) {
      mst.push(edge);
      totalWeight += edge.weight;
    }
  }

  const rows = [
    ['From', 'To', 'Weight'],
    ...mst.map(({ from, to, weight }) => [from, to, String(weight)])
  ];

  return {
    table: textTable.default(rows),
    totalWeight
  };
}
export default computeMST;
// Generation time: 7.981s
// Result: FAIL