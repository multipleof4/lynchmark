async function computeMST(tomlString) {
  if (typeof tomlString !== 'string') throw new TypeError('computeMST expects a TOML string');

  const [tomlMod, heapMod, tableMod] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist/heap'),
    import('https://esm.sh/text-table')
  ]);

  const parse = tomlMod.parse ?? tomlMod.default?.parse;
  const Heap = heapMod.default ?? heapMod.Heap;
  const textTable = tableMod.default ?? tableMod;

  if (typeof parse !== 'function') throw new Error('Failed to load smol-toml parser');
  if (typeof Heap !== 'function') throw new Error('Failed to load mnemonist Heap');
  if (typeof textTable !== 'function') throw new Error('Failed to load text-table');

  const cfg = parse(tomlString) ?? {};
  const rawEdges = Array.isArray(cfg.edges) ? cfg.edges : [];
  const edges = rawEdges.map((e, i) => {
    const from = e?.from;
    const to = e?.to;
    const weight = Number(e?.weight);
    if (typeof from !== 'string' || !from || typeof to !== 'string' || !to || !Number.isFinite(weight)) {
      throw new TypeError(`Invalid edge at index ${i}`);
    }
    return { from, to, weight };
  });

  const nodes = [...new Set(edges.flatMap(e => [e.from, e.to]))];
  const target = Math.max(0, nodes.length - 1);

  class UnionFind {
    constructor(items) {
      this.parent = new Map(items.map(x => [x, x]));
      this.rank = new Map(items.map(x => [x, 0]));
    }
    find(x) {
      let p = this.parent.get(x);
      if (p !== x) {
        p = this.find(p);
        this.parent.set(x, p);
      }
      return p;
    }
    union(a, b) {
      let ra = this.find(a), rb = this.find(b);
      if (ra === rb) return false;
      let rka = this.rank.get(ra), rkb = this.rank.get(rb);
      if (rka < rkb) [ra, rb] = [rb, ra], [rka, rkb] = [rkb, rka];
      this.parent.set(rb, ra);
      if (rka === rkb) this.rank.set(ra, rka + 1);
      return true;
    }
  }

  const heap = new Heap((a, b) => a.weight - b.weight);
  for (const e of edges) heap.push(e);

  const uf = new UnionFind(nodes);
  const mst = [];
  let totalWeight = 0;

  while (heap.size && mst.length < target) {
    const e = heap.pop();
    if (uf.union(e.from, e.to)) {
      mst.push(e);
      totalWeight += e.weight;
    }
  }

  const rows = [['From', 'To', 'Weight'], ...mst.map(e => [e.from, e.to, String(e.weight)])];
  return { table: textTable(rows), totalWeight };
}
export default computeMST;
// Generation time: 18.070s
// Result: PASS