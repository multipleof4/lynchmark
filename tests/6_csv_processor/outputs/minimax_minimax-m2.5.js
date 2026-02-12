async function processCSV(csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) {
  const { default: Papa } = await import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm');
  const { data } = Papa.parse(csv, { header: true });
  const groups = {};
  for (const row of data) {
    if (row[filterColumn] == filterValue) {
      const key = row[groupBy];
      (groups[key] ??= []).push(row);
    }
  }
  return Object.entries(groups).map(([key, rows]) => {
    const result = operation === 'count'
      ? rows.length
      : (() => {
          const sum = rows.reduce((acc, r) => acc + (Number(r[aggregateColumn]) || 0), 0);
          return operation === 'sum' ? sum : sum / rows.length;
        })();
    return { [groupBy]: key, result };
  });
}
export default processCSV;
// Generation time: 58.093s
// Result: PASS