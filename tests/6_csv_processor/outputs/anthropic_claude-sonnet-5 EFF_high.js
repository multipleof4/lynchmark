async function processCSV(csvString, config) {
  const { filterColumn, filterValue, groupBy: groupCol, aggregateColumn, operation } = config;

  const [{ default: Papa }, { groupBy }] = await Promise.all([
    import('https://esm.sh/papaparse@5.4.1'),
    import('https://esm.sh/lodash-es@4.17.21'),
  ]);

  const { data } = Papa.parse(csvString, { header: true, skipEmptyLines: true });

  const filtered = data.filter(row => row[filterColumn] == filterValue);

  const groups = groupBy(filtered, row => row[groupCol]);

  return Object.entries(groups).map(([key, rows]) => {
    const values = rows.map(row => Number(row[aggregateColumn]) || 0);
    const sum = values.reduce((acc, v) => acc + v, 0);

    const result =
      operation === 'sum' ? sum :
      operation === 'avg' ? sum / values.length :
      values.length;

    return { [groupCol]: key, result };
  });
}
export default processCSV;
// Generation time: 8.882s
// Result: PASS