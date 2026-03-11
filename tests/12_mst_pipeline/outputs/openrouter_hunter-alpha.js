async function computeMST(tomlStr) {
  const [tomlMod, heapMod, tableMod] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist/heap'),
    import('https://esm.sh/text-table')
  ]);
  const {parse} = tomlMod;
  const {default: Heap} = heapMod;
  const {default: textTable} = tableMod;

  const edges = parse(tomlStr).edges;
  const nodes = new Set();
  for (const e of edges) { nodes.add(e.from); nodes.add(e.to); }

  const heap = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => heap.push(e));

  const p = {}, r = {};
  function find(x) { return p[x] === x ? x : (p[x] = find(p[x])); }
  function union(a, b) {
    a = find(a); b = find(b);
    if (a === b) return false;
    if (r[a] < r[b]) [a, b] = [b, a];
    p[b] = a;
    if (r[a] === r[b]) r[a]++;
    return true;
  }
  nodes.forEach(n => { p[n] = n; r[n] = 0; });

  const mst = [];
  let total = 0;
  const needed = nodes.size - 1;
  while (heap.size > 0 && mst.length < needed) {
    const e = heap.pop();
    if (union(e.from, e.to)) {
      mst.push([e.from, e.to, String(e.weight)]);
      total += e.weight;
    }
  }

  return {
    table: textTable([['From', 'To', 'Weight'], ...mst]),
    totalWeight: total
  };
}
export default computeMST;
// Generation time: 23.699s
// Result: PASS