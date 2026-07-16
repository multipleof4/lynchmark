
  const [{ parse }, m, { default: table }] = await Promise.all([
    import('https://esm.sh/smol-toml@1'),
    import('https://esm.sh/mnemonist@0.39'),
    import('https://esm.sh/text-table@0.2')
  ]);
  const { Heap } = m.default ?? m;

  const { edges = [] } = parse(toml);
  const heap = new Heap((a, b) => a.weight - b.weight);
  const parent = new Map(), rank = new Map();

  const find = x => {
    const p = parent.get(x);
    return p === x ? x : (parent.set(x, find(p)), parent.get(x));
  };

  for (const e of edges) {
    heap.push(e);
    for (const v of [e.from, e.to])
      if (!parent.has(v)) (parent.set(v, v), rank.set(v, 0));
  }

  const rows = [['From', 'To', 'Weight']];
  let totalWeight = 0, need = parent.size - 1;

  while (need-- > 0 && heap.size) {
    const { from, to, weight } = heap.pop();
    const a = find(from), b = find(to);
    if (a === b) continue;
    if (rank.get(a) < rank.get(b)) parent.set(a, b);
    else {
      parent.set(b, a);
      if (rank.get(a) === rank.get(b)) rank.set(a, rank.get(a) + 1);
    }
    rows.push([from, to, String(weight)]);
    totalWeight += weight;
  }

  return { table: table(rows), totalWeight };
}
export default computeMST;
// Generation time: 107.250s
// Result: FAIL