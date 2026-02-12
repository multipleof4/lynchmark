async function computeMST(tomlStr) {
  const [{ parse }, { Heap }, { default: table }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml/+esm'),
    import('https://cdn.jsdelivr.net/npm/mnemonist/+esm'),
    import('https://cdn.jsdelivr.net/npm/text-table/+esm')
  ]);

  const { edges } = parse(tomlStr);
  const heap = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => heap.push(e));

  const p = new Map, r = new Map;
  const find = x => p.get(x) === x ? x : p.set(x, find(p.get(x))).get(x);
  const mk = n => p.has(n) || (p.set(n, n) && r.set(n, 0));

  const mst = [];
  let totalWeight = 0;

  while (heap.size) {
    const { from, to, weight } = heap.pop();
    mk(from); mk(to);
    let [x, y] = [find(from), find(to)];
    if (x !== y) {
      if (r.get(x) < r.get(y)) [x, y] = [y, x];
      p.set(y, x);
      if (r.get(x) === r.get(y)) r.set(x, r.get(x) + 1);
      mst.push([from, to, String(weight)]);
      totalWeight += weight;
    }
  }

  return { table: table([['From', 'To', 'Weight'], ...mst]), totalWeight };
}
export default computeMST;
// Generation time: 368.359s
// Result: PASS