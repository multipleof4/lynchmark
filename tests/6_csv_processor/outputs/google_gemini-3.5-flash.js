export async function processCSV(csvString, config) {
  const { filterColumn, filterValue, groupBy, aggregateColumn, operation } = config;
  const { default: Papa } = await import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm');
  
  const { data } = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  const groups = {};

  for (const row of data) {
    if (row[filterColumn] == filterValue) {
      const groupVal = row[groupBy];
      groups[groupVal] = groups[groupVal] || { sum: 0, count: 0 };
      groups[groupVal].sum += +row[aggregateColumn] || 0;
      groups[groupVal].count++;
    }
  }

  return Object.entries(groups).map(([key, { sum, count }]) => ({
    [groupBy]: key,
    result: operation === 'count' ? count : operation === 'sum' ? sum : sum / count
  }));
}
export default processCSV;
// Generation time: 23.400s
// Result: PASS