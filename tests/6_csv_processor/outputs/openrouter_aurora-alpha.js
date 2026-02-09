async function processCSV(csv, cfg) {
  const [{csvParse}] = await Promise.all([
    import('https://cdn.skypack.dev/d3-dsv')
  ]);
  const _ = await import('https://cdn.skypack.dev/lodash');

  const rows = csvParse(csv);
  const filtered = rows.filter(r => r[cfg.filterColumn] == cfg.filterValue);
  const groups = _.groupBy(filtered, cfg.groupBy);

  return Object.entries(groups).map(([k, g]) => {
    let res;
    if (cfg.operation === 'count') {
      res = g.length;
    } else {
      const sum = g.reduce((s, r) => s + (Number(r[cfg.aggregateColumn]) || 0), 0);
      res = cfg.operation === 'sum' ? sum : sum / g.length;
    }
    return { [cfg.groupBy]: k, result: res };
  });
}
export default processCSV;
// Generation time: 1.891s
// Result: PASS