const computeMST = async tomlString => {
  const [{parse}, {Heap}, {default: table}] = await Promise.all([
    import('https://esm.sh/smol-toml@0.9.1'),
    import('https://esm.sh/mnemonist@0.11.4/heap'),
    import('https://esm.sh/text-table@0.2.0')
  ]);

  const config = parse(tomlString);
  const edges = config.edges || [];
  const nodes = new Set();
  edges.forEach(e => {
    nodes.add(e.from);
    nodes.add(e.to);
  });

  const ids = new Map([...nodes].map((n, i) => [n, i]));
  const parent = [...ids.values()];
  const rank = parent.map(() => 0);
  const find = x => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (x, y) => {
    let rx = find(x);
    let ry = find(y);
    if (rx === ry) return false;
    if (rank[rx] < rank[ry]) parent[rx] = ry;
    else if (rank[rx] > rank[ry]) parent[ry] = rx;
    else {
      parent[ry] = rx;
      rank[rx]++;
    }
    return true;
  };

  const heap = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => heap.push(e));

  const mst = [];
  let totalWeight = 0;
  while (heap.size && mst.length < nodes.size - 1) {
    const edge = heap.pop();
    const idxFrom = ids.get(edge.from);
    const idxTo = ids.get(edge.to);
    if (union(idxFrom, idxTo)) {
      mst.push([edge.from, edge.to, String(edge.weight)]);
      totalWeight += edge.weight;
    }
  }

  const output = [['From', 'To', 'Weight'], ...mst];
  return {
    table: table(output, {align: ['l', 'l', 'r']}),
    totalWeight
  };
};
export default computeMST;
// Generation time: 17.592s
// Result: FAIL