async function computeMST(tomlString) {
  const [
    { parse },
    { default: Heap },
    textTable
  ] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist/heap'),
    import('https://esm.sh/text-table')
  ]);

  const { edges } = parse(tomlString);

  const heap = new Heap((a, b) => a.weight - b.weight);
  const nodes = new Set();

  for (const e of edges) {
    heap.push(e);
    nodes.add(e.from);
    nodes.add(e.to);
  }

  const parent = {}, rank = {};
  for (const n of nodes) {
    parent[n] = n;
    rank[n] = 0;
  }

  const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));

  const union = (x, y) => {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  };

  const mst = [];
  let total = 0;
  const target = nodes.size - 1;

  while (mst.length < target && heap.size) {
    const { from, to, weight } = heap.pop();
    if (union(from, to)) {
      mst.push([from, to, String(weight)]);
      total += weight;
    }
  }

  const table = textTable([['From', 'To', 'Weight'], ...mst]);

  return { table, totalWeight: total };
}
export default computeMST;
// Generation time: 6.257s
// Result: FAIL