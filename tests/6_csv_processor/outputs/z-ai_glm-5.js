const processCSV = async (csv, { filterColumn: fc, filterValue: fv, groupBy: gb, aggregateColumn: ac, operation: op }) => {
  const Papa = (await import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js')).default;
  const groups = Papa.parse(csv, { header: true }).data
    .filter(r => r[fc] == fv)
    .reduce((acc, r) => {
      const key = r[gb];
      acc[key] = acc[key] || { s: 0, c: 0 };
      acc[key].s += Number(r[ac]) || 0;
      acc[key].c++;
      return acc;
    }, {});
  return Object.entries(groups).map(([key, { s, c }]) => ({
    [gb]: key,
    result: op === 'sum' ? s : op === 'avg' ? s / c : c
  }));
};
export default processCSV;
// Generation time: 57.701s
// Result: FAIL