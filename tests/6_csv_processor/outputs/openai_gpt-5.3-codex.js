async function processCSV(csv, config = {}) {
  const [{ default: Papa }, { groupBy, sumBy }] = await Promise.all([
    import('https://esm.sh/papaparse@5.4.1'),
    import('https://esm.sh/lodash-es@4.17.21')
  ]);

  if (typeof csv !== 'string') throw new TypeError('csv must be a string');

  const {
    filterColumn,
    filterValue,
    groupBy: groupKey,
    aggregateColumn,
    operation
  } = config;

  if (!filterColumn || !groupKey || !aggregateColumn) throw new TypeError('Invalid configuration');
  if (!['sum', 'avg', 'count'].includes(operation)) throw new TypeError('Invalid operation');

  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) throw new Error(parsed.errors[0].message);

  const rows = parsed.data.filter(r => r?.[filterColumn] == filterValue);
  if (!rows.length) return [];

  const num = v => {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  return Object.entries(groupBy(rows, r => r?.[groupKey])).map(([k, g]) => {
    const count = g.length;
    const sum = sumBy(g, r => num(r?.[aggregateColumn]));
    const result = operation === 'count' ? count : operation === 'avg' ? sum / count : sum;
    return { [groupKey]: k, result };
  });
}
export default processCSV;
// Generation time: 21.127s
// Result: PASS