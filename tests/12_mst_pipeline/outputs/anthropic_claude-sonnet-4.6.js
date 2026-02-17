async function computeMST(tomlString) {
  const [{ parse }, { default: Heap }, { default: textTable }] = await Promise.all([
    import("https://esm.sh/smol-toml"),
    import("https://esm.sh/mnemonist/heap.js"),
    import("https://esm.sh/text-table"),
  ]);

  const { edges } = parse(tomlString);

  const heap = new Heap((a, b) => a.weight - b.weight);
  edges.forEach(e => heap.push(e));

  const nodes = [...new Set(edges.flatMap(e => [e.from, e.to]))];
  const parent = Object.fromEntries(nodes.map(n => [n, n]));
  const rank = Object.fromEntries(nodes.map(n => [n, 0]));

  const find = n => {
    if (parent[n] !== n) parent[n] = find(parent[n]);
    return parent[n];
  };

  const union = (a, b) => {
    const [ra, rb] = [find(a), find(b)];
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else { parent[rb] = ra; rank[ra]++; }
    return true;
  };

  const mstEdges = [];
  const limit = nodes.length - 1;

  while (heap.size && mstEdges.length < limit) {
    const { from, to, weight } = heap.pop();
    if (union(from, to)) mstEdges.push([from, to, String(weight)]);
  }

  const totalWeight = mstEdges.reduce((s, [,, w]) => s + Number(w), 0);
  const table = textTable([["From", "To", "Weight"], ...mstEdges]);

  return { table, totalWeight };
}
export default computeMST;
// Generation time: 5.943s
// Result: PASS