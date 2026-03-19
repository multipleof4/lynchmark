async function computeMST(toml) {
  const [smol, mne, txt] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml/+esm'),
    import('https://cdn.jsdelivr.net/npm/mnemonist/+esm'),
    import('https://cdn.jsdelivr.net/npm/text-table/+esm')
  ]);
  const { parse } = smol;
  const { Heap } = mne;
  const textTable = txt.default || txt;
  const { edges } = parse(toml);
  const nodes = [...new Set(edges.flatMap(e => [e.from, e.to]))];
  const heap = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => heap.push(e));
  const parent = new Map();
  const rank = new Map();
  nodes.forEach(n => { parent.set(n, n); rank.set(n, 0); });
  const find = x => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)));
      x = parent.get(x);
    }
    return x;
  };
  const union = (x, y) => {
    const px = find(x), py = find(y);
    if (px === py) return false;
    const rx = rank.get(px), ry = rank.get(py);
    if (rx < ry) parent.set(px, py);
    else if (rx > ry) parent.set(py, px);
    else { parent.set(py, px); rank.set(px, rx + 1); }
    return true;
  };
  const mst = [];
  let total = 0;
  while (mst.length < nodes.length - 1 && heap.size) {
    const e = heap.pop();
    if (union(e.from, e.to)) {
      mst.push([e.from, e.to, String(e.weight)]);
      total += e.weight;
    }
  }
  const table = textTable([['From', 'To', 'Weight'], ...mst]);
  return { table, totalWeight: total };
}
export default computeMST;
// Generation time: 303.821s
// Result: PASS