async function processCSV(csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) {
  const { parse } = await import('https://cdn.skypack.dev/papaparse');
  const { data: rows } = parse(csv, { header: true, dynamicTyping: true });

  const filtered = rows.filter(r => r[filterColumn] == filterValue);
  const groups = filtered.reduce((acc, row) => {
    const key = row[groupBy];
    acc[key] = acc[key] || [];
    acc[key].push(Number(row[aggregateColumn]) || 0);
    return acc;
  }, {});

  return Object.entries(groups).map(([key, vals]) => {
    let res;
    if (operation === 'sum') res = vals.reduce((a, b) => a + b, 0);
    if (operation === 'count') res = vals.length;
    if (operation === 'avg') res = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { [groupBy]: key, result: res };
  });
}
export default processCSV;
// Generation time: 1.399s
// Result: PASS