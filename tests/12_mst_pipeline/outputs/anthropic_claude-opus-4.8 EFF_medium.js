async function computeMST(toml) {
  const [{ parse }, mnemonist, textTableMod] = await Promise.all([
    import("https://esm.sh/smol-toml"),
    import("https://esm.sh/mnemonist"),
    import("https://esm.sh/text-table")
  ]);

  const Heap = mnemonist.Heap || mnemonist.default.Heap;
  const table = textTableMod.default || textTableMod;

  const edges = parse(toml).edges || [];
  const heap = new Heap((a, b) => a.weight - b.weight);
  const nodes = new Set();

  for (const e of edges) {
    heap.push(e);
    nodes.add(e.from);
    nodes.add(e.to);
  }

  const parent = new Map();
  const rank = new Map();
  for (const n of nodes) {
    parent.set(n, n);
    rank.set(n, 0);
  }

  const find = x => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r);
    while (parent.get(x) !== r) {
      const next = parent.get(x);
      parent.set(x, r);
      x = next;
    }
    return r;
  };

  const union = (a, b) => {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    const da = rank.get(ra), db = rank.get(rb);
    if (da < db) parent.set(ra, rb);
    else if (da > db) parent.set(rb, ra);
    else {
      parent.set(rb, ra);
      rank.set(ra, da + 1);
    }
    return true;
  };

  const rows = [];
  let totalWeight = 0;
  const need = Math.max(nodes.size - 1, 0);

  while (heap.size && rows.length < need) {
    const e = heap.pop();
    if (union(e.from, e.to)) {
      rows.push([e.from, e.to, String(e.weight)]);
      totalWeight += e.weight;
    }
  }

  return {
    table: table([["From", "To", "Weight"], ...rows]),
    totalWeight
  };
}
export default computeMST;
// Generation time: 8.341s
// Result: PASS