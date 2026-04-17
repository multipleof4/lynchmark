async function computeMST(tomlString) {
  const [{parse}, {default: Heap}, {default: textTable}] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist/heap'),
    import('https://esm.sh/text-table')
  ]);

  const {edges = []} = parse(tomlString);
  const heap = new Heap((a, b) => a.weight - b.weight);
  const nodes = new Set();

  for (const e of edges) {
    heap.push(e);
    nodes.add(e.from);
    nodes.add(e.to);
  }

  const parent = new Map(), rank = new Map();
  for (const n of nodes) {
    parent.set(n, n);
    rank.set(n, 0);
  }

  const find = x => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r);
    while (parent.get(x) !== r) {
      const next = parent.get(x);
      parent.set(x, r);
      x = next;
    }
    return r;
  };

  const union = (a, b) => {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    const sa = rank.get(ra), sb = rank.get(rb);
    if (sa < sb) parent.set(ra, rb);
    else if (sa > sb) parent.set(rb, ra);
    else { parent.set(rb, ra); rank.set(ra, sa + 1); }
    return true;
  };

  const mst = [];
  let totalWeight = 0;
  const target = nodes.size - 1;

  while (heap.size && mst.length < target) {
    const e = heap.pop();
    if (union(e.from, e.to)) {
      mst.push([e.from, e.to, String(e.weight)]);
      totalWeight += e.weight;
    }
  }

  const table = textTable([['From', 'To', 'Weight'], ...mst]);
  return {table, totalWeight};
}
export default computeMST;
// Generation time: 7.828s
// Result: PASS