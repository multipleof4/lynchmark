async function processCSV(csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) {
  const { default: Papa } = await import('https://esm.sh/papaparse@5.4.1');
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const groups = {};
  for (const row of data) {
    if (row[filterColumn] != filterValue) continue;
    const key = row[groupBy];
    const n = Number(row[aggregateColumn]);
    const val = Number.isFinite(n) ? n : 0;
    (groups[key] ??= { sum: 0, count: 0 });
    groups[key].sum += val;
    groups[key].count++;
  }
  const calc = {
    sum: g => g.sum,
    avg: g => g.sum / g.count,
    count: g => g.count,
  }[operation];
  return Object.entries(groups).map(([k, g]) => ({ [groupBy]: k, result: calc(g) }));
}
export default processCSV;
// Generation time: 5.004s
// Result: PASS