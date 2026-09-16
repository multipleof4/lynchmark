async function computeMST(toml) {
  if (typeof toml !== "string")
    throw new TypeError("Expected a TOML string.");

  const [{ parse }, { default: Heap }, { default: textTable }] =
    await Promise.all([
      import("https://esm.sh/smol-toml@1.3.1"),
      import("https://esm.sh/mnemonist@0.39.8/heap.js"),
      import("https://esm.sh/text-table@0.2.0")
    ]);

  const { edges } = parse(toml);
  if (!Array.isArray(edges))
    throw new TypeError('Expected an "edges" array.');

  const parent = new Map(), rank = new Map();
  const heap = new Heap((a, b) => a.weight - b.weight || a.index - b.index);

  for (const [index, edge] of edges.entries()) {
    if (
      !edge ||
      typeof edge.from !== "string" ||
      typeof edge.to !== "string" ||
      !Number.isFinite(edge.weight)
    )
      throw new TypeError(
        `Invalid edge at index ${index}: expected string endpoints and a finite numeric weight.`
      );

    const { from, to, weight } = edge;
    heap.push({ from, to, weight, index });

    for (const node of [from, to]) {
      if (parent.has(node)) continue;
      parent.set(node, node);
      rank.set(node, 0);
    }
  }

  function find(node) {
    while (node !== parent.get(node)) {
      parent.set(node, parent.get(parent.get(node)));
      node = parent.get(node);
    }
    return node;
  }

  function union(a, b) {
    a = find(a);
    b = find(b);
    if (a === b) return false;
    if (rank.get(a) < rank.get(b)) [a, b] = [b, a];

    parent.set(b, a);
    if (rank.get(a) === rank.get(b))
      rank.set(a, rank.get(a) + 1);

    return true;
  }

  const mst = [];
  let totalWeight = 0;

  while (heap.size && mst.length < parent.size - 1) {
    const { from, to, weight } = heap.pop();
    if (!union(from, to)) continue;

    mst.push([from, to, String(weight)]);
    totalWeight += weight;
    if (!Number.isFinite(totalWeight))
      throw new RangeError("Total weight exceeds the finite Number range.");
  }

  return {
    table: textTable(
      [["From", "To", "Weight"], ...mst],
      { align: ["l", "l", "r"] }
    ),
    totalWeight
  };
}
export default computeMST;
// Generation time: 147.182s
// Result: PASS