const computeMST = async (tomlStr) => {
  const { parse } = await import('https://esm.sh/smol-toml');
  const { Heap } = await import('https://esm.sh/mnemonist');
  const textTable = (await import('https://esm.sh/text-table')).default;

  const config = parse(tomlStr);
  const edges = config.edges || [];

  class UnionFind {
    constructor() { this.p = {}; this.r = {}; }
    add(n) { if (!(n in this.p)) { this.p[n] = n; this.r[n] = 0; } }
    find(n) { return this.p[n] === n ? n : (this.p[n] = this.find(this.p[n])); }
    union(a, b) {
      const ra = this.find(a), rb = this.find(b);
      if (ra === rb) return false;
      if (this.r[ra] < this.r[rb]) this.p[ra] = rb;
      else if (this.r[ra] > this.r[rb]) this.p[rb] = ra;
      else { this.p[rb] = ra; this.r[ra]++; }
      return true;
    }
  }

  const uf = new UnionFind();
  const heap = new Heap((a, b) => a.weight - b.weight);
  const nodes = new Set();

  for (const e of edges) {
    nodes.add(e.from);
    nodes.add(e.to);
    uf.add(e.from);
    uf.add(e.to);
    heap.push(e);
  }

  const mst = [];
  let totalWeight = 0;

  while (heap.size && mst.length < nodes.size - 1) {
    const e = heap.pop();
    if (uf.union(e.from, e.to)) {
      mst.push([e.from, e.to, String(e.weight)]);
      totalWeight += e.weight;
    }
  }

  return {
    table: textTable([['From', 'To', 'Weight'], ...mst]),
    totalWeight
  };
};
export default computeMST;
// Generation time: 22.055s
// Result: PASS