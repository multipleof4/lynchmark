async function computeMST(t) {
  const [{ default: parse }, { Heap }, { default: table }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml@1.2.0/dist/index.mjs'),
    import('https://cdn.jsdelivr.net/npm/mnemonist@0.39.6/heap.mjs'),
    import('https://cdn.jsdelivr.net/npm/text-table@0.2.0/+esm')
  ])
  const c = parse(t)
  const edges = c.edges
  const nodes = new Set
  edges.forEach(({ from, to }) => { nodes.add(from); nodes.add(to) })
  const parent = {}
  const rank = {}
  nodes.forEach(n => { parent[n] = n; rank[n] = 0 })
  const find = x => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const union = (x, y) => {
    const rx = find(x)
    const ry = find(y)
    if (rx === ry) return !1
    if (rank[rx] < rank[ry]) parent[rx] = ry
    else if (rank[rx] > rank[ry]) parent[ry] = rx
    else { parent[ry] = rx; rank[rx]++ }
    return !0
  }
  const heap = new Heap((a, b) => a.weight > b.weight)
  edges.forEach(e => heap.push(e))
  const mst = []
  const target = nodes.size - 1
  let total = 0
  while (heap.size && mst.length < target) {
    const e = heap.pop()
    if (union(e.from, e.to)) {
      mst.push([e.from, e.to, String(e.weight)])
      total += e.weight
    }
  }
  return { table: table([['From', 'To', 'Weight'], ...mst]), totalWeight: total }
}
export default computeMST;
// Generation time: 116.739s
// Result: FAIL