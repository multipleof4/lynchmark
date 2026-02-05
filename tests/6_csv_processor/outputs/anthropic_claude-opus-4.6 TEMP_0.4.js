async function processCSV(csv, config) {
  const { filterColumn, filterValue, groupBy, aggregateColumn, operation } = config;

  const { default: Papa } = await import("https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm");

  const parsed = Papa.parse(csv.trim(), { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  const filtered = rows.filter(r => r[filterColumn] == filterValue);

  const groups = {};
  for (const row of filtered) {
    const key = row[groupBy];
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  return Object.entries(groups).map(([groupValue, groupRows]) => {
    let result;
    if (operation === "count") {
      result = groupRows.length;
    } else {
      const vals = groupRows.map(r => {
        const n = Number(r[aggregateColumn]);
        return isNaN(n) ? 0 : n;
      });
      const sum = vals.reduce((a, b) => a + b, 0);
      result = operation === "avg" ? sum / groupRows.length : sum;
    }
    return { [groupBy]: groupValue, result };
  });
}
export default processCSV;
// Generation time: 4.670s
// Result: PASS