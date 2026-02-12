async function computeMST(toml) {
  const { parse } = await import('https://esm.sh/smol-toml');
  const { Heap } = await import('https://esm.sh/mnemonist');
  const tbl = (await import('https://esm.sh/text-table')).default;
  const { edges = [] } = parse(toml);
  const h = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => h.push(e));
  const nodes = new Set();
  edges.forEach(e => { nodes.add(e.from); nodes.add(e.to); });
  const arr = [...nodes], N = arr.length, id = Object.fromEntries(arr.map((n, i) => [n, i]));
  const p = new Int32Array(N), r = new Uint8Array(N);
  for (let i = 0; i < N; i++) p[i] = i;
  const find = x => p[x] === x ? x : p[x] = find(p[x]);
  const union = (x, y) => {
    let u = find(x), v = find(y);
    if (u === v) return false;
    if (r[u] < r[v]) p[u] = v;
    else if (r[u] > r[v]) p[v] = u;
    else { p[v] = u; r[u]++; }
    return true;
  };
  const mst = [];
  let tw = 0;
  while (h.size && mst.length < N - 1) {
    const e = h.pop();
    if (union(id[e.from], id[e.to])) {
      mst.push([e.from, e.to, String(e.weight)]);
      tw += e.weight;
    }
  }
  const rows = [['From', 'To', 'Weight'], ...mst];
  return { table: tbl(rows, { align: ['l', 'l', 'r'] }), totalWeight: tw };
}
export default computeMST;
// Generation time: 86.373s
// Result: PASS