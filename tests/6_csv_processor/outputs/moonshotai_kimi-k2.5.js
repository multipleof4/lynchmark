const processCSV = async (csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) => {
  const { default: Papa } = await import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm');
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const groups = data.filter(r => r[filterColumn] == filterValue).reduce((acc, row) => {
    const key = row[groupBy], val = +row[aggregateColumn] || 0;
    (acc[key] ||= { sum: 0, count: 0 }).sum += val;
    acc[key].count++;
    return acc;
  }, {});
  return Object.entries(groups).map(([key, vals]) => ({
    [groupBy]: key,
    result: operation === 'count' ? vals.count : operation === 'avg' ? vals.sum / vals.count : vals.sum
  }));
};
export default processCSV;
// Generation time: 34.470s
// Result: PASS