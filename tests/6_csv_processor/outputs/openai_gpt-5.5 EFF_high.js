const csvDeps = Promise.all([
  import("https://cdn.jsdelivr.net/npm/d3-dsv@3/+esm"),
  import("https://cdn.jsdelivr.net/npm/d3-array@3/+esm")
]);

async function processCSV(csv, config = {}) {
  const [{ csvParse }, { rollups }] = await csvDeps;
  const { filterColumn, filterValue, groupBy, aggregateColumn, operation } = config;
  const ops = new Set(["sum", "avg", "count"]);

  if (!ops.has(operation)) throw new TypeError("Invalid operation");

  const num = r => {
    const n = Number(r[aggregateColumn]);
    return Number.isFinite(n) ? n : 0;
  };

  const rows = csvParse(String(csv ?? ""))
    .filter(r => r[filterColumn] == filterValue);

  return rollups(
    rows,
    rs => {
      if (operation === "count") return rs.length;

      const sum = rs.reduce((a, r) => a + num(r), 0);
      return operation === "avg" ? sum / rs.length : sum;
    },
    r => r[groupBy]
  ).map(([k, result]) => ({ [groupBy]: k, result }));
}
export default processCSV;
// Generation time: 26.121s
// Result: PASS