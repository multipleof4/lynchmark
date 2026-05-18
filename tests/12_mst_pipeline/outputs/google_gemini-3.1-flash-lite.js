async function computeMST(tomlStr) {
  const [{ parse }, { Heap }, { default: table }] = await Promise.all([
    import("https://cdn.skypack.dev/smol-toml"),
    import("https://cdn.skypack.dev/mnemonist/heap"),
    import("https://cdn.skypack.dev/text-table")
  ]);

  const { edges } = parse(tomlStr), nodes = new Set();
  const heap = new Heap((a, b) => a.weight - b.weight);
  
  edges.forEach(e => {
    heap.push(e);
    nodes.add(e.from);
    nodes.add(e.to);
  });

  const parent = new Map(), rank = new Map();
  nodes.forEach(n => parent.set(n, n) || rank.set(n, 0));

  const find = i => {
    while (parent.get(i) !== i) {
      parent.set(i, parent.get(parent.get(i)));
      i = parent.get(i);
    }
    return i;
  };

  const mst = [['From', 'To', 'Weight']], nCount = nodes.size;
  let totalWeight = 0;

  while (heap.size() > 0 && mst.length < nCount) {
    const { from, to, weight } = heap.pop();
    let rootU = find(from), rootV = find(to);

    if (rootU !== rootV) {
      if (rank.get(rootU) < rank.get(rootV)) [rootU, rootV] = [rootV, rootU];
      parent.set(rootV, rootU);
      if (rank.get(rootU) === rank.get(rootV)) rank.set(rootU, rank.get(rootU) + 1);
      
      mst.push([from, to, String(weight)]);
      totalWeight += weight;
    }
  }

  return { table: table(mst), totalWeight };
}
export default computeMST;
// Generation time: 2.142s
// Result: FAIL