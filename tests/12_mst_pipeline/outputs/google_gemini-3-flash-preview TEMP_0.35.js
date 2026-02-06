async function computeMST(tomlStr) {
  const [toml, { Heap }, table] = await Promise.all([
    import('https://cdn.skypack.dev/smol-toml'),
    import('https://cdn.skypack.dev/mnemonist'),
    import('https://cdn.skypack.dev/text-table')
  ]);

  const { edges } = toml.parse(tomlStr);
  const heap = new Heap((a, b) => a.weight - b.weight);
  const nodes = new Set();

  edges.forEach(e => {
    heap.push(e);
    nodes.add(e.from);
    nodes.add(e.to);
  });

  const parent = {};
  const rank = {};
  nodes.forEach(n => {
    parent[n] = n;
    rank[n] = 0;
  });

  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));

  const union = (i, j) => {
    let rootI = find(i), rootJ = find(j);
    if (rootI !== rootJ) {
      if (rank[rootI] < rank[rootJ]) [rootI, rootJ] = [rootJ, rootI];
      parent[rootJ] = rootI;
      if (rank[rootI] === rank[rootJ]) rank[rootI]++;
      return true;
    }
    return false;
  };

  const mst = [];
  let totalWeight = 0;
  const target = nodes.size - 1;

  while (heap.size && mst.length < target) {
    const { from, to, weight } = heap.pop();
    if (union(from, to)) {
      mst.push([from, to, String(weight)]);
      totalWeight += weight;
    }
  }

  return {
    table: table.default([['From', 'To', 'Weight'], ...mst]),
    totalWeight
  };
}
export default computeMST;
// Generation time: 13.942s
// Result: PASS