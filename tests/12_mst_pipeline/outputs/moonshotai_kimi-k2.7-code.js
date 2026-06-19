const computeMST = async (toml) => {
  const [{ parse }, { Heap }, { default: table }] = await Promise.all([
    import("https://esm.sh/smol-toml"),
    import("https://esm.sh/mnemonist"),
    import("https://esm.sh/text-table")
  ]);

  const { edges = [] } = parse(toml);
  const nodes = [...new Set(edges.flatMap((e) => [e.from, e.to]))];

  const parent = Object.fromEntries(nodes.map((n) => [n, n]));
  const rank = Object.fromEntries(nodes.map((n) => [n, 0]));

  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a, b) => {
    let ra = find(a);
    let rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra]++;
    return true;
  };

  const heap = new Heap((a, b) => a.weight - b.weight);
  for (const e of edges) heap.push(e);

  const mst = [];
  let totalWeight = 0;

  while (heap.size && mst.length < nodes.length - 1) {
    const e = heap.pop();
    if (union(e.from, e.to)) {
      mst.push([e.from, e.to, String(e.weight)]);
      totalWeight += e.weight;
    }
  }

  return {
    table: table([["From", "To", "Weight"], ...mst]),
    totalWeight
  };
};

self.computeMST = computeMST;
export default computeMST;
// Generation time: 37.889s
// Result: PASS