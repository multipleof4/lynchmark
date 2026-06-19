const processCSV = async (csv, {
  filterColumn: f,
  filterValue: v,
  groupBy: g,
  aggregateColumn: a,
  operation: o
}) => {
  const [{ default: P }, { groupBy: G }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm'),
    import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm')
  ]);

  const N = x => {
    const y = Number(x);
    return Number.isFinite(y) ? y : 0;
  };

  const rows = P.parse(csv, { header: true, skipEmptyLines: true }).data;
  const groups = G(rows.filter(r => r[f] == v), r => r[g]);

  return Object.entries(groups).map(([k, list]) => {
    let result = 0;

    if (o === 'count') {
      result = list.length;
    } else {
      const total = list.reduce((s, r) => s + N(r[a]), 0);
      result = o === 'avg' ? total / list.length : total;
    }

    return { [g]: k, result };
  });
};
export default processCSV;
// Generation time: 38.066s
// Result: PASS