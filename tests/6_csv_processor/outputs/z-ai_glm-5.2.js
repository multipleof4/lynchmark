const processCSV = async (csv, c) => {
  const Papa = (await import('https://esm.run/papaparse@5')).default;
  const { data } = Papa.parse(csv, { header: true });

  return Object.values(
    data.reduce((acc, r) => {
      if (r[c.filterColumn] != c.filterValue) return acc;
      const k = r[c.groupBy];
      acc[k] ??= { [c.groupBy]: k, sum: 0, count: 0 };
      acc[k].sum += Number(r[c.aggregateColumn]) || 0;
      acc[k].count++;
      return acc;
    }, {})
  ).map(g => ({
    [c.groupBy]: g[c.groupBy],
    result: c.operation === 'count' ? g.count : c.operation === 'sum' ? g.sum : g.sum / g.count
  }));
};
export default processCSV;
// Generation time: 31.429s
// Result: PASS