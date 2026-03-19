async function hexchain(s) {
  const [smol, sr, ss, AjvMod, tbl, dp] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml@1.1.2/dist/smol-toml.esm.js'),
    import('https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js'),
    import('https://cdn.jsdelivr.net/npm/simple-statistics@7.8.3/+esm'),
    import('https://cdn.jsdelivr.net/npm/ajv@8.11.0/dist/ajv.bundle.min.js'),
    import('https://cdn.jsdelivr.net/npm/text-table@3.1.0/index.js'),
    import('https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.esm.js')
  ]);

  const parseToml = smol.default || smol;
  const seedrandom = sr.default || sr;
  const { mean, standardDeviation, median } = ss;
  const Ajv = AjvMod.default || AjvMod;
  const textTable = tbl.default || tbl;
  const DOMPurify = dp.default || dp;

  const cfg = parseToml.parse(s);
  const ajv = new Ajv();
  const schema = {
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  };
  if (!ajv.validate(schema, cfg)) return { valid: false, errors: ajv.errorsText() };

  const rng = new seedrandom(cfg.seed);
  const nums = Array.from({ length: cfg.count }, () => rng());

  const r6 = v => Math.round(v * 1e6) / 1e6;
  const meanVal = r6(mean(nums));
  const stddevVal = r6(standardDeviation(nums));
  const medianVal = r6(median(nums));

  const rows = [
    ['Stat', 'Value'],
    ['mean', String(meanVal)],
    ['stddev', String(stddevVal)],
    ['median', String(medianVal)]
  ];
  const tableStr = textTable(rows);
  const html = DOMPurify.sanitize(`<pre class="stats">${tableStr}</pre>`);

  return {
    valid: true,
    label: cfg.label,
    stats: { mean: meanVal, stddev: stddevVal, median: medianVal },
    table: html,
    count: cfg.count
  };
}
export default hexchain;
// Generation time: 119.316s
// Result: FAIL