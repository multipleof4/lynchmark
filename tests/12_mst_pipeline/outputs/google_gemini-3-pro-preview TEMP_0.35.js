const computeMST = async (tomlInput) => {
  const [{ parse }, { default: Heap }, { default: table }] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist/heap'),
    import('https://esm.sh/text-table')
  ])

  const { edges } = parse(tomlInput)
  const heap = new Heap((a, b) => a.weight - b.weight)
  const parent = new Map(), rank = new Map()

  edges.forEach(e => {
    heap.push(e);
    [e.from, e.to].forEach(n => {
      if (!parent.has(n)) parent.set(n, n), rank.set(n, 0)
    })
  })

  const find = n => parent.get(n) === n ? n : (parent.set(n, find(parent.get(n))), parent.get(n))

  const union = (a, b) => {
    const rootA = find(a), rootB = find(b)
    if (rootA === rootB) return false
    const rA = rank.get(rootA), rB = rank.get(rootB)
    if (rA < rB) parent.set(rootA, rootB)
    else parent.set(rootB, rootA), rA === rB && rank.set(rootA, rA + 1)
    return true
  }

  const rows = [['From', 'To', 'Weight']]
  let totalWeight = 0

  while (heap.size) {
    const { from, to, weight } = heap.pop()
    if (union(from, to)) {
      rows.push([from, to, String(weight)])
      totalWeight += weight
    }
  }

  return { table: table(rows), totalWeight }
}
export default computeMST;
// Generation time: 37.108s
// Result: PASS