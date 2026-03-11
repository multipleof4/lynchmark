const processCSV = async (csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) => {
  const [{ default: Papa }, { default: _ }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js'),
    import('https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js')
  ]);
  
  const { data } = Papa.parse(csv.trim(), { header: true, dynamicTyping: true });
  const filtered = data.filter(row => row[filterColumn] == filterValue);
  const groups = _.groupBy(filtered, groupBy);
  
  return Object.entries(groups).map(([key, rows]) => {
    const values = rows.map(row => Number(row[aggregateColumn]) || 0);
    const result = operation === 'sum' ? values.reduce((a, b) => a + b, 0)
      : operation === 'avg' ? values.reduce((a, b) => a + b, 0) / values.length
      : rows.length;
    
    return { [groupBy]: key, result };
  });
};
export default processCSV;
// Generation time: 20.976s
// Result: FAIL