async function computeMST(toml) {
  const [tomlModule, heapModule, tableModule] = await Promise.all([
    import("https://esm.sh/smol-toml@1.3.1"),
    import("https://esm.sh/mnemonist@0.40.3/heap"),
    import("https://esm.sh/text-table@0.2.0")
  ]);

  const parse = tomlModule.parse ?? tomlModule.default?.parse;
  const Heap = heapModule.default ?? heapModule.Heap;
  const textTable = tableModule.default ?? tableModule;

  if (typeof parse !== "function" || typeof Heap !== "function" ||
      typeof textTable !== "function") {
    throw new Error("Failed to load required libraries");
  }

  const config = parse(toml);
  const edges = config?.edges;

  if (!Array.isArray(edges)) {
    throw new TypeError("TOML must contain an edges array");
  }

  const nodes = new Set();
  const heap = new Heap((a, b) => a.weight - b.weight);

  for (const edge of edges) {
    const { from, to, weight } = edge ?? {};

    if (typeof from !== "string" || typeof to !== "string" ||
        !from || !to || typeof weight !== "number" ||
        !Number.isFinite(weight)) {
      throw new TypeError("Each edge must have valid from, to, and weight fields");
    }

    nodes.add(from);
    nodes.add(to);
    heap.push({ from, to, weight });
  }

  const parent = new Map();
  const rank = new Map();

  for (const node of nodes) {
    parent.set(node, node);
    rank.set(node, 0);
  }

  const find = node => {
    let root = node;

    while (parent.get(root) !== root) {
      root = parent.get(root);
    }

    while (parent.get(node) !== node) {
      const next = parent.get(node);
      parent.set(node, root);
      node = next;
    }

    return root;
  };

  const union = (left, right) => {
    let leftRoot = find(left);
    let rightRoot = find(right);

    if (leftRoot === rightRoot) {
      return false;
    }

    if (rank.get(leftRoot) < rank.get(rightRoot)) {
      [leftRoot, rightRoot] = [rightRoot, leftRoot];
    }

    parent.set(rightRoot, leftRoot);

    if (rank.get(leftRoot) === rank.get(rightRoot)) {
      rank.set(leftRoot, rank.get(leftRoot) + 1);
    }

    return true;
  };

  const mst = [];
  let totalWeight = 0;

  while (heap.size && mst.length < nodes.size - 1) {
    const edge = heap.pop();

    if (union(edge.from, edge.to)) {
      mst.push([edge.from, edge.to, String(edge.weight)]);
      totalWeight += edge.weight;
    }
  }

  return {
    table: textTable([["From", "To", "Weight"], ...mst]),
    totalWeight
  };
}
export default computeMST;
// Generation time: 11.402s
// Result: PASS