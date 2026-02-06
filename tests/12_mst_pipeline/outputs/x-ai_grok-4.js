async function computeMST(toml) {
  const [smol, mnemo, ttable] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml'),
    import('https://cdn.jsdelivr.net/npm/mnemonist'),
    import('https://cdn.jsdelivr.net/npm/text-table')
  ]);
  const {parse} = smol;
  const {Heap} = mnemo;
  const textTable = ttable.default;

  const config = parse(toml);
  const edges = config.edges;

  const nodes = new Set();
  for (const e of edges) {
    nodes.add(e.from);
    nodes.add(e.to);
  }
  const numNodes = nodes.size;

  const parent = new Map();
  const rank = new Map();
  for (const node of nodes) {
    parent.set(node, node);
    rank.set(node, 0);
  }

  function find(p, x) {
    if (p.get(x) !== x) {
      p.set(x, find(p, p.get(x)));
    }
    return p.get(x);
  }

  function union(p, r, x, y) {
    let px = find(p, x);
    let py = find(p, y);
    if (px === py) return false;
    if (r.get(px) < r.get(py)) {
      p.set(px, py);
    } else if (r.get(px) > r.get(py)) {
      p.set(py, px);
    } else {
      p.set(py, px);
      r.set(px, r.get(px) + 1);
    }
    return true;
  }

  const edgeHeap = new Heap((a, b) => a.weight - b.weight);
  for (const edge of edges) {
    edgeHeap.push(edge);
  }

  const mst = [];
  let totalWeight = 0;
  while (mst.length < numNodes - 1 && edgeHeap.size > 0) {
    const edge = edgeHeap.pop();
    if (union(parent, rank, edge.from, edge.to)) {
      mst.push(edge);
      totalWeight += edge.weight;
    }
  }

  const rows = [['From', 'To', 'Weight']];
  for (const e of mst) {
    rows.push([e.from, e.to, String(e.weight)]);
  }

  const tableStr = textTable(rows);
  return { table: tableStr, totalWeight };
}
export default computeMST;
// Generation time: 49.564s
// Result: FAIL