async function processCSV(csv, { filterColumn: fc, filterValue: fv, groupBy: gb, aggregateColumn: ac, operation: op }) {
  const { default: P } = await import("https://cdn.jsdelivr.net/npm/papaparse@5/+esm")
  const rows = P.parse(csv, { header: true, skipEmptyLines: true }).data.filter(r => r[fc] == fv)
  const groups = rows.reduce((a, r) => ((a[r[gb]] ??= []).push(r), a), {})
  return Object.entries(groups).map(([k, v]) => {
    const sum = v.reduce((s, r) => s + (Number(r[ac]) || 0), 0)
    return { [gb]: k, result: op == 'count' ? v.length : op == 'sum' ? sum : sum / v.length }
  })
}
export default processCSV;
// Generation time: 46.157s
// Result: PASS