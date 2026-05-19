export async function computeMST(tomlStr) {
  const [toml, heapMod, tableMod] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist/heap'),
    import('https://esm.sh/text-table')
  ]);

  const parse = toml.parse;
  const Heap = heapMod.default || heapMod;
  const textTable = tableMod.default || tableMod;

  const { edges } = parse(tomlStr);
  const heap = new Heap((a, b) => a.weight - b.weight);
  const nodes = new Set();

  for (const e of edges) {
    heap.push(e);
    nodes.add(e.from);
    nodes.add(e.to);
  }

  const parent = {};
  const rank = {};

  const find = (i) => {
    if (!(i in parent)) parent[i] = i;
    return parent[i] === i ? i : (parent[i] = find(parent[i]));
  };

  const union = (i, j) => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      const rI = rank[rootI] || 0;
      const rJ = rank[rootJ] || 0;
      if (rI < rJ) {
        parent[rootI] = rootJ;
      } else if (rI > rJ) {
        parent[rootJ] = rootI;
      } else {
        parent[rootJ] = rootI;
        rank[rootI] = rI + 1;
      }
      return true;
    }
    return false;
  };

  const mst = [];
  let totalWeight = 0;
  const targetEdges = nodes.size - 1;

  while (heap.size > 0 && mst.length < targetEdges) {
    const edge = heap.pop();
    if (union(edge.from, edge.to)) {
      mst.push(edge);
      totalWeight += edge.weight;
    }
  }

  const rows = [
    ['From', 'To', 'Weight'],
    ...mst.map(e => [e.from, e.to, String(e.weight)])
  ];

  return {
    table: textTable(rows),
    totalWeight
  };
}
export default computeMST;
// Generation time: 17.195s
// Result: PASS