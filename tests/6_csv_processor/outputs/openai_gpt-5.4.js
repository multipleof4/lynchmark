export async function processCSV(csv, config) {
  const [{ default: Papa }, _] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm'),
    import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js')
  ])

  const {
    filterColumn,
    filterValue,
    groupBy,
    aggregateColumn,
    operation
  } = config || {}

  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: v => String(v).trim()
  })

  const toNum = v => {
    const n = Number(v)
    return Number.isNaN(n) ? 0 : n
  }

  const filtered = data.filter(row => row?.[filterColumn] == filterValue)
  const groups = _.groupBy(filtered, row => row?.[groupBy])

  return Object.entries(groups).map(([key, rows]) => {
    const count = rows.length
    const sum = rows.reduce((a, row) => a + toNum(row?.[aggregateColumn]), 0)
    const result =
      operation === 'count' ? count :
      operation === 'avg' ? (count ? sum / count : 0) :
      sum

    return { [groupBy]: key, result }
  })
}
export default processCSV;
// Generation time: 3.573s
// Result: PASS