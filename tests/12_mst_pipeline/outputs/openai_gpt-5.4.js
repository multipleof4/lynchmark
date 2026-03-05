async function computeMST(tomlString) {
  const [{ parse }, heapMod, { default: table }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml/+esm'),
    import('https://cdn.jsdelivr.net/npm/mnemonist/+esm'),
    import('https://cdn.jsdelivr.net/npm/text-table/+esm')
  ])

  const Heap = heapMod.Heap || heapMod.default?.Heap
  if (!Heap) throw new Error('Failed to load mnemonist Heap')

  const data = parse(String(tomlString ?? ''))
  const edges = Array.isArray(data?.edges) ? data.edges : []
  const norm = edges.map((e, i) => {
    const from = e?.from
    const to = e?.to
    const weight = e?.weight
    if (typeof from !== 'string' || typeof to !== 'string' || !Number.isFinite(weight)) {
      throw new TypeError(`Invalid edge at index ${i}`)
    }
    return { from, to, weight: +weight }
  })

  const nodes = [...new Set(norm.flatMap(({ from, to }) => [from, to]))]
  const parent = new Map(nodes.map(n => [n, n]))
  const rank = new Map(nodes.map(n => [n, 0]))

  const find = x => {
    let p = parent.get(x)
    if (p !== x) {
      p = find(p)
      parent.set(x, p)
    }
    return p
  }

  const union = (a, b) => {
    a = find(a)
    b = find(b)
    if (a === b) return false
    const ra = rank.get(a)
    const rb = rank.get(b)
    if (ra < rb) parent.set(a, b)
    else if (ra > rb) parent.set(b, a)
    else {
      parent.set(b, a)
      rank.set(a, ra + 1)
    }
    return true
  }

  const heap = new Heap((a, b) => a.weight - b.weight)
  for (const edge of norm) heap.push(edge)

  const mst = []
  let totalWeight = 0
  const limit = Math.max(0, nodes.length - 1)

  while (heap.size && mst.length < limit) {
    const edge = heap.pop()
    if (union(edge.from, edge.to)) {
      mst.push([edge.from, edge.to, String(edge.weight)])
      totalWeight += edge.weight
    }
  }

  return {
    table: table([['From', 'To', 'Weight'], ...mst]),
    totalWeight
  }
}
export default computeMST;
// Generation time: 5.731s
// Result: PASS