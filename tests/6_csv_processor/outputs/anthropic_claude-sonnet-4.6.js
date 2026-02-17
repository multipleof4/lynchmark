async function processCSV(csvString, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) {
  const [{ default: Papa }] = await Promise.all([
    import("https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm"),
  ]);

  const { data } = Papa.parse(csvString.trim(), { header: true, skipEmptyLines: true });

  const filtered = data.filter(row => row[filterColumn] == filterValue);

  const groups = filtered.reduce((acc, row) => {
    const key = row[groupBy];
    (acc[key] ??= []).push(row);
    return acc;
  }, {});

  const toNum = v => { const n = Number(v); return isNaN(n) ? 0 : n; };

  return Object.entries(groups).map(([groupValue, rows]) => {
    const vals = rows.map(r => toNum(r[aggregateColumn]));
    const sum = vals.reduce((a, b) => a + b, 0);
    const result =
      operation === "sum"   ? sum :
      operation === "avg"   ? sum / rows.length :
      operation === "count" ? rows.length : 0;
    return { [groupBy]: groupValue, result };
  });
}
export default processCSV;
// Generation time: 4.438s
// Result: PASS