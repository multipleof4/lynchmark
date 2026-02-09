async function computeMST(tomlStr) {
  const [{ parse }, { Heap }, table] = await Promise.all([
    import('https://unpkg.com/smol-toml@latest/dist/smol-toml.esm.js'),
    import('https://unpkg.com/mnemonist@latest/dist/mnemonist.esm.js'),
    import('https://unpkg.com/text-table@latest/index.js')
  ])
  const { edges = [] } = parse(tomlStr)
  const heap = new Heap((a, b) => a.weight - b.weight)
  const nodes = new Set()
  for (const e of edges) {
    heap.push(e)
    nodes.add(e.from)
    nodes.add(e.to)
  }
  const parent = {}
  const rank = {}
  for (const n of nodes) {
    parent[n] = n
    rank[n] = 0
  }
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const union = (a, b) => {
    a = find(a)
    b = find(b)
    if (a === b) return false
    if (rank[a] < rank[b]) [a, b] = [b, a]
    parent[b] = a
    if (rank[a] === rank[b]) rank[a]++
    return true
  }
  const mst = []
  let total = 0
  while (mst.length < nodes.size - 1 && heap.size > 0) {
    const e = heap.pop()
    if (union(e.from, e.to)) {
      mst.push([e.from, e.to, String(e.weight)])
      total += e.weight
    }
  }
  const tbl = table([['From', 'To', 'Weight'], ...mst])
  return { table: tbl, totalWeight: total }
}
export default computeMST;
// Generation time: 1.686s
// Result: FAIL