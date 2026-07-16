async function processCSV(csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) {
  const [{ default: Papa }, { groupBy: group, sumBy }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm'),
    import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm')
  ]);
  const num = r => +r[aggregateColumn] || 0;
  const ops = {
    sum: rs => sumBy(rs, num),
    avg: rs => sumBy(rs, num) / rs.length,
    count: rs => rs.length
  };
  if (!ops[operation]) throw new Error(`Unsupported operation: ${operation}`);
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return Object.entries(group(data.filter(r => r[filterColumn] == filterValue), groupBy))
    .map(([key, rows]) => ({ [groupBy]: key, result: ops[operation](rows) }));
}


export default processCSV;
// Generation time: 79.891s
// Result: PASS