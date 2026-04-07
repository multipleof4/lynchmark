const computeMST = async s => {
  const [{ parse }, { Heap }, { default: tt }] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist'),
    import('https://esm.sh/text-table')
  ])
  const { edges } = parse(s)
  const p = {}, r = {}
  const find = x => p[x] === x ? x : (p[x] = find(p[x]))
  const union = (a, b) => {
    a = find(a); b = find(b)
    if (a === b) return false
    if (r[a] < r[b]) [a, b] = [b, a]
    p[b] = a
    if (r[a] === r[b]) r[a]++
    return true
  }
  const h = new Heap((a, b) => a.weight - b.weight)
  const n = new Set()
  for (const e of edges) {
    if (!(e.from in p)) { p[e.from] = e.from; r[e.from] = 0 }
    if (!(e.to in p)) { p[e.to] = e.to; r[e.to] = 0 }
    h.push(e)
    n.add(e.from); n.add(e.to)
  }
  const m = []
  let w = 0
  while (m.length < n.size - 1 && h.size) {
    const { from, to, weight } = h.pop()
    if (union(from, to)) {
      m.push([from, to, String(weight)])
      w += weight
    }
  }
  return { table: tt([['From', 'To', 'Weight'], ...m]), totalWeight: w }
}
export default computeMST;
// Generation time: 47.623s
// Result: PASS