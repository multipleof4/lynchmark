const processCSV = async (csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) => {
  const { default: Papa } = await import('https://esm.sh/papaparse@5.4.1');
  const { data } = Papa.parse(csv.trim(), { header: true, skipEmptyLines: true });
  const groups = new Map();

  for (const row of data) {
    if (row[filterColumn] != filterValue) continue;
    const key = row[groupBy];
    const val = +row[aggregateColumn] || 0;
    const g = groups.get(key) ?? { sum: 0, count: 0 };
    g.sum += val;
    g.count++;
    groups.set(key, g);
  }

  return [...groups].map(([key, { sum, count }]) => ({
    [groupBy]: key,
    result: operation === 'sum' ? sum : operation === 'avg' ? sum / count : count
  }));
};
export default processCSV;
// Generation time: 14.656s
// Result: PASS