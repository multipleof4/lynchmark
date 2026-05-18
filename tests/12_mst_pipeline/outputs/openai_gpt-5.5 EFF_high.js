const mstDeps = () => mstDeps.p ??= Promise.all([
  import('https://esm.sh/smol-toml'),
  import('https://esm.sh/mnemonist/heap'),
  import('https://esm.sh/text-table')
]).then(([toml, heap, text]) => ({
  parse: toml.parse ?? toml.default?.parse ?? toml.default,
  Heap: heap.default ?? heap.Heap ?? heap,
  table: text.default ?? text.table ?? text
}));

class UnionFind {
  constructor(nodes) {
    this.p = new Map;
    this.r = new Map;
    for (const n of nodes) {
      this.p.set(n, n);
      this.r.set(n, 0);
    }
  }

  find(x) {
    let p = this.p.get(x);
    if (p !== x) this.p.set(x, p = this.find(p));
    return p;
  }

  union(a, b) {
    let x = this.find(a), y = this.find(b);
    if (x === y) return false;

    let rx = this.r.get(x), ry = this.r.get(y);
    if (rx < ry) [x, y] = [y, x], [rx, ry] = [ry, rx];

    this.p.set(y, x);
    if (rx === ry) this.r.set(x, rx + 1);
    return true;
  }
}

async function computeMST(input) {
  if (typeof input !== 'string') throw new TypeError('Expected a TOML string');

  const {parse, Heap, table} = await mstDeps();
  const {edges: raw} = parse(input);

  if (!Array.isArray(raw)) throw new TypeError('Expected TOML to contain an edges array');

  const nodes = new Set;
  const edges = raw.map((e, i) => {
    const from = e?.from, to = e?.to, weight = Number(e?.weight);

    if (typeof from !== 'string' || typeof to !== 'string' || !Number.isFinite(weight)) {
      throw new TypeError(`Invalid edge at index ${i}`);
    }

    nodes.add(from);
    nodes.add(to);
    return {from, to, weight, i};
  });

  const heap = new Heap((a, b) => a.weight - b.weight || a.i - b.i);
  for (const e of edges) heap.push(e);

  const uf = new UnionFind(nodes);
  const mst = [];
  let totalWeight = 0, left = edges.length;

  while (mst.length < nodes.size - 1 && left) {
    left--;

    const e = heap.pop();
    if (!uf.union(e.from, e.to)) continue;

    mst.push([e.from, e.to, String(e.weight)]);
    totalWeight += e.weight;
  }

  return {
    table: table([['From', 'To', 'Weight'], ...mst]),
    totalWeight
  };
}
export default computeMST;
// Generation time: 47.382s
// Result: PASS