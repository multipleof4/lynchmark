async function computeMST(tomlStr) {
  const [{ parse }, { Heap }, table] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist/heap'),
    import('https://esm.sh/text-table')
  ]);

  const { edges } = parse(tomlStr);
  const nodes = new Set();
  const heap = new Heap((a, b) => a.weight - b.weight);

  edges.forEach(e => {
    heap.push(e);
    nodes.add(e.from);
    nodes.add(e.to);
  });

  const parent = new Map([...nodes].map(n => [n, n]));
  const rank = new Map([...nodes].map(n => [n, 0]));

  const find = i => {
    if (parent.get(i) !== i) parent.set(i, find(parent.get(i)));
    return parent.get(i);
  };

  const union = (i, j) => {
    let r1 = find(i), r2 = find(j);
    if (r1 !== r2) {
      rank.get(r1) < rank.get(r2) ? parent.set(r1, r2) : parent.set(r2, r1);
      if (rank.get(r1) === rank.get(r2)) rank.set(r1, rank.get(r1) + 1);
      return true;
    }
    return false;
  };

  const mst = [['From', 'To', 'Weight']];
  let totalWeight = 0;

  while (heap.size > 0 && mst.length < nodes.size) {
    const { from, to, weight } = heap.pop();
    if (union(from, to)) {
      mst.push([from, to, String(weight)]);
      totalWeight += weight;
    }
  }

  return {
    table: table.default(mst, { align: ['l', 'l', 'r'] }),
    totalWeight
  };
}
export default computeMST;
// Generation time: 1.865s
// Result: FAIL