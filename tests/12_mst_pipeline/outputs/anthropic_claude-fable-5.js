async function computeMST(tomlStr) {
  const [{ parse }, { default: Heap }, { default: table }] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist/heap'),
    import('https://esm.sh/text-table'),
  ]);

  const { edges = [] } = parse(tomlStr);
  const heap = new Heap((a, b) => a.weight - b.weight);
  const parent = new Map();
  const rank = new Map();

  for (const e of edges) {
    heap.push(e);
    for (const n of [e.from, e.to]) {
      if (!parent.has(n)) {
        parent.set(n, n);
        rank.set(n, 0);
      }
    }
  }

  const find = n => {
    while (parent.get(n) !== n) {
      parent.set(n, parent.get(parent.get(n)));
      n = parent.get(n);
    }
    return n;
  };

  const union = (a, b) => {
    a = find(a);
    b = find(b);
    if (a === b) return false;
    if (rank.get(a) < rank.get(b)) [a, b] = [b, a];
    parent.set(b, a);
    if (rank.get(a) === rank.get(b)) rank.set(a, rank.get(a) + 1);
    return true;
  };

  const rows = [['From', 'To', 'Weight']];
  const need = parent.size - 1;
  let totalWeight = 0;

  while (heap.size && rows.length <= need) {
    const e = heap.pop();
    if (union(e.from, e.to)) {
      rows.push([e.from, e.to, String(e.weight)]);
      totalWeight += e.weight;
    }
  }

  return { table: table(rows), totalWeight };
}
export default computeMST;
// Generation time: 14.612s
// Result: PASS