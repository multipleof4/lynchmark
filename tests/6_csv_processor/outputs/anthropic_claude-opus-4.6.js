async function processCSV(csv, config) {
  const { filterColumn, filterValue, groupBy, aggregateColumn, operation } = config;

  const { default: Papa } = await import("https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm");

  const parsed = Papa.parse(csv.trim(), {
    header: true,
    skipEmptyLines: true
  });

  const filtered = parsed.data.filter(row => row[filterColumn] == filterValue);

  const groups = new Map();
  for (const row of filtered) {
    const key = row[groupBy];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const toNum = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return [...groups.entries()].map(([groupValue, rows]) => {
    let result;
    if (operation === "count") {
      result = rows.length;
    } else {
      const sum = rows.reduce((acc, r) => acc + toNum(r[aggregateColumn]), 0);
      result = operation === "avg" ? sum / rows.length : sum;
    }
    return { [groupBy]: groupValue, result };
  });
}
export default processCSV;
// Generation time: 5.843s
// Result: PASS