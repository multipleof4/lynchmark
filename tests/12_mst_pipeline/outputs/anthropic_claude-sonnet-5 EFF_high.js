async function computeMST(tomlString) {
  const [{ parse }, { Heap }, { default: textTable }] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist'),
    import('https://esm.sh/text-table'),
  ]);

  const { edges = [] } = parse(tomlString);
  if (!Array.isArray(edges) || edges.length === 0) {
    return { table: textTable([['From', 'To', 'Weight']]), totalWeight: 0 };
  }

  class UnionFind {
    constructor(nodes) {
      this.parent = new Map(nodes.map(n => [n, n]));
      this.rank = new Map(nodes.map(n => [n, 0]));
    }
    find(x) {
      let p = this.parent.get(x);
      if (p !== x) { p = this.find(p); this.parent.set(x, p); }
      return p;
    }
    union(a, b) {
      let ra = this.find(a), rb = this.find(b);
      if (ra === rb) return false;
      const rkA = this.rank.get(ra), rkB = this.rank.get(rb);
      if (rkA < rkB) [ra, rb] = [rb, ra];
      this.parent.set(rb, ra);
      if (rkA === rkB) this.rank.set(ra, rkA + 1);
      return true;
    }
  }

  const heap = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => heap.push(e));

  const nodeSet = new Set();
  edges.forEach(({ from, to }) => { nodeSet.add(from); nodeSet.add(to); });

  const uf = new UnionFind([...nodeSet]);
  const target = nodeSet.size - 1;
  const mst = [];
  let totalWeight = 0;

  while (heap.size > 0 && mst.length < target) {
    const { from, to, weight } = heap.pop();
    if (uf.union(from, to)) {
      mst.push([from, to, String(weight)]);
      totalWeight += weight;
    }
  }

  const rows = [['From', 'To', 'Weight'], ...mst];
  return { table: textTable(rows), totalWeight };
}
export default computeMST;
// Generation time: 24.146s
// Result: PASS