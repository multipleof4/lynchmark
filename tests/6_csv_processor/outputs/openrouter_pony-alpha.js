const processCSV = async (csv, { filterColumn: fc, filterValue: fv, groupBy: gb, aggregateColumn: ac, operation: op }) => {
  const { default: Papa } = await import('https://esm.run/papaparse')
  const { data } = Papa.parse(csv, { header: true })
  const grouped = data.filter(r => r[fc] == fv).reduce((a, r) => {
    const k = r[gb], v = +r[ac] || 0
    a[k] = a[k] || { s: 0, c: 0 }
    a[k].s += v
    a[k].c++
    return a
  }, {})
  return Object.entries(grouped).map(([k, { s, c }]) => ({
    [gb]: k,
    result: op === 'count' ? c : op === 'sum' ? s : s / c
  }))
}
export default processCSV;
// Generation time: 257.221s
// Result: PASS