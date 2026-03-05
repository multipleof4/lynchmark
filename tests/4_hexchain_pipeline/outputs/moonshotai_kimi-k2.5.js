const hexchain = async (t) => {
  const [
    { parse },
    { default: s },
    { mean, standardDeviation, median },
    { default: A },
    { default: l },
    { default: D }
  ] = await Promise.all(['smol-toml', 'seedrandom', 'simple-statistics', 'ajv', 'text-table', 'dompurify'].map(p => import(`https://cdn.jsdelivr.net/npm/${p}/+esm`)));
  const c = parse(t);
  const v = { type: 'object', required: ['seed', 'count', 'label'], properties: { seed: { type: 'string' }, count: { type: 'integer', minimum: 1, maximum: 10000 }, label: { type: 'string', minLength: 1 } } };
  const a = new A();
  if (!a.validate(v, c)) return { valid: !1, errors: a.errorsText() };
  const r = s(c.seed);
  const n = Array.from({ length: c.count }, () => r());
  const f = x => Math.round(x * 1e6) / 1e6;
  const m = f(mean(n));
  const d = f(standardDeviation(n, !1));
  const e = f(median(n));
  const h = l([['Stat', 'Value'], ['mean', String(m)], ['stddev', String(d)], ['median', String(e)]]);
  const g = D.sanitize('<pre class="stats">' + h + '</pre>');
  return { valid: !0, label: c.label, stats: { mean: m, stddev: d, median: e }, table: g, count: c.count };
};
export default hexchain;
// Generation time: 175.601s
// Result: PASS