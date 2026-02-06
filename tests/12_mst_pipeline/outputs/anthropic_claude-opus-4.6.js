async function computeMST(tomlString) {
  const [
    { parse },
    { default: Heap },
    textTable
  ] = await Promise.all([
    import("https://esm.sh/smol-toml"),
    import("https://esm.sh/mnemonist/heap"),
    import("https://esm.sh/text-table")
  ]);

  const table = textTable.default || textTable;
  const { edges } = parse(tomlString);

  const heap = new Heap((a, b) => a.weight - b.weight);
  const nodes = new Set();

  for (const e of edges) {
    heap.push(e);
    nodes.add(e.from);
    nodes.add(e.to);
  }

  const parent = {};
  const rank = {};
  for (const n of nodes) {
    parent[n] = n;
    rank[n] = 0;
  }

  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  const union = (a, b) => {
    let ra = find(a), rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra]++;
    return true;
  };

  const mst = [];
  let totalWeight = 0;
  const target = nodes.size - 1;

  while (mst.length < target && heap.size) {
    const { from, to, weight } = heap.pop();
    if (union(from, to)) {
      mst.push([from, to, String(weight)]);
      totalWeight += weight;
    }
  }

  const rows = [["From", "To", "Weight"], ...mst];

  return {
    table: table(rows),
    totalWeight
  };
}
export default computeMST;
// Generation time: 7.267s
// Result: PASS