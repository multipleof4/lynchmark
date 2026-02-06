async function computeMST(tomlStr) {
  const [{ parse }, { Heap }, { default: textTable }] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist'),
    import('https://esm.sh/text-table')
  ]);

  const { edges } = parse(tomlStr);
  const nodes = new Set(edges.flatMap(e => [e.from, e.to]));
  const parent = {}, rank = {};

  for (const n of nodes) {
    parent[n] = n;
    rank[n] = 0;
  }

  const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));
  
  const union = (a, b) => {
    const rootA = find(a), rootB = find(b);
    if (rootA === rootB) return false;
    if (rank[rootA] < rank[rootB]) parent[rootA] = rootB;
    else if (rank[rootA] > rank[rootB]) parent[rootB] = rootA;
    else { parent[rootB] = rootA; rank[rootA]++; }
    return true;
  };

  const heap = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => heap.push(e));

  const mst = [];
  let totalWeight = 0;

  while (heap.size) {
    const { from, to, weight } = heap.pop();
    if (union(from, to)) {
      mst.push([from, to, String(weight)]);
      totalWeight += weight;
      if (mst.length === nodes.size - 1) break;
    }
  }

  return {
    table: textTable([['From', 'To', 'Weight'], ...mst]),
    totalWeight
  };
}
export default computeMST;
// Generation time: 200.325s
// Result: PASS