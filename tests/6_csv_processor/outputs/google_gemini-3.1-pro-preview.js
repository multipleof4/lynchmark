export const processCSV = async (c, { filterColumn: f, filterValue: v, groupBy: g, aggregateColumn: a, operation: o }) => {
  const { default: P } = await import('https://esm.sh/papaparse');
  return [...P.parse(c, { header: true, skipEmptyLines: true }).data
    .filter(r => r[f] == v)
    .reduce((m, r) => {
      const k = r[g], n = +r[a] || 0, x = m.get(k) || { s: 0, c: 0 };
      return m.set(k, { s: x.s + n, c: x.c + 1 });
    }, new Map())]
    .map(([k, x]) => ({ [g]: k, result: o == 'count' ? x.c : o == 'sum' ? x.s : x.s / x.c }));
};
export default processCSV;
// Generation time: 50.753s
// Result: PASS