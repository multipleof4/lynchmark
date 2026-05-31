const processCSV = async (csv, config) => {
  const { filterColumn, filterValue, groupBy, aggregateColumn, operation } = config;
  const [{ default: Papa }, { default: _ }] = await Promise.all([
    import("https://esm.sh/papaparse@5.4.1"),
    import("https://esm.sh/lodash-es@4.17.21")
  ]);

  const { data } = Papa.parse(csv.trim(), { header: true, skipEmptyLines: true });
  const num = v => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const filtered = data.filter(r => r[filterColumn] == filterValue);
  const groups = _.groupBy(filtered, r => r[groupBy]);

  return _.map(groups, (rows, key) => {
    const vals = rows.map(r => num(r[aggregateColumn]));
    const sum = _.sum(vals);
    const result =
      operation === "sum" ? sum :
      operation === "avg" ? sum / rows.length :
      rows.length;
    return { [groupBy]: key, result };
  });
};
export default processCSV;
// Generation time: 6.170s
// Result: PASS