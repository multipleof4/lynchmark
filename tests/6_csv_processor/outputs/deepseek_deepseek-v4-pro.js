async function processCSV(csv, c) {
  const { default: P } = await import(
    'https://cdn.jsdelivr.net/npm/papaparse@5/+esm'
  );
  const { filterColumn: f, filterValue: v, groupBy: g, aggregateColumn: a, operation: o } = c;
  const rows = P.parse(csv, { header: true, skipEmptyLines: true }).data;
  const filtered = rows.filter((r) => r[f] == v);
  const groups = {};
  for (const r of filtered) {
    const k = r[g];
    groups[k] = groups[k] || { n: 0, s: 0 };
    groups[k].n++;
    groups[k].s += +r[a] || 0;
  }
  return Object.entries(groups).map(([k, { n, s }]) => ({
    [g]: k,
    result: o === 'sum' ? s : o === 'avg' ? s / n : n,
  }));
}
export default processCSV;
// Generation time: 75.337s
// Result: PASS