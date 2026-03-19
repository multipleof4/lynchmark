async function processCSV(csvString, config) {
  const {
    filterColumn,
    filterValue,
    groupBy,
    aggregateColumn,
    operation
  } = config;

  const { default: Papa } = await import('https://esm.sh/papaparse');
  const { data: rows, errors } = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true
  });

  if (errors.length) throw new Error('CSV parsing failed: ' + errors[0].message);

  const filtered = rows.filter(r => r[filterColumn] == filterValue);
  const groups = new Map();

  for (const row of filtered) {
    const key = row[groupBy];
    if (!groups.has(key)) groups.set(key, { sum: 0, count: 0 });
    const entry = groups.get(key);
    const num = Number(row[aggregateColumn]);
    entry.sum += isNaN(num) ? 0 : num;
    entry.count++;
  }

  const resultArr = [...groups].map(([key, val]) => {
    let result;
    if (operation === 'sum') result = val.sum;
    else if (operation === 'avg') result = val.count ? val.sum / val.count : 0;
    else if (operation === 'count') result = val.count;
    else throw new Error('Unsupported operation: ' + operation);
    return { [groupBy]: key, result };
  });

  return resultArr;
}
export default processCSV;
// Generation time: 61.787s
// Result: PASS