async function processCSV(csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) {
  const { parse } = await import('https://cdn.skypack.dev/papaparse');
  const { data } = parse(csv, { header: true, dynamicTyping: true });

  const groups = data
    .filter(r => r[filterColumn] == filterValue)
    .reduce((acc, r) => {
      const key = r[groupBy];
      const val = Number(r[aggregateColumn]) || 0;
      acc[key] ??= { sum: 0, count: 0 };
      acc[key].sum += val;
      acc[key].count += 1;
      return acc;
    }, {});

  return Object.entries(groups).map(([k, v]) => ({
    [groupBy]: k,
    result: operation === 'sum' ? v.sum :
            operation === 'avg' ? v.sum / v.count : v.count
  }));
}
export default processCSV;
// Generation time: 1.360s
// Result: PASS