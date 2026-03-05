export async function hexchain(t) {
  const [
    { parse },
    { default: SR },
    { mean, standardDeviation, median },
    { default: Ajv },
    { default: TT },
    { default: DP }
  ] = await Promise.all([
    'smol-toml', 'seedrandom', 'simple-statistics', 'ajv', 'text-table', 'dompurify'
  ].map(m => import(`https://esm.sh/${m}`)));

  const c = parse(t), a = new Ajv();
  
  if (!a.validate({
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  }, c)) return { valid: false, errors: a.errorsText() };

  const r = new SR(c.seed), n = Array.from({ length: c.count }, () => r());
  const f = x => Number(x(n).toFixed(6));
  const [m, s, d] = [mean, standardDeviation, median].map(f);

  return {
    valid: true,
    label: c.label,
    count: c.count,
    stats: { mean: m, stddev: s, median: d },
    table: DP.sanitize(`<pre class="stats">${TT([
      ['Stat', 'Value'],
      ['mean', String(m)],
      ['stddev', String(s)],
      ['median', String(d)]
    ])}</pre>`)
  };
}
export default hexchain;
// Generation time: 58.112s
// Result: PASS