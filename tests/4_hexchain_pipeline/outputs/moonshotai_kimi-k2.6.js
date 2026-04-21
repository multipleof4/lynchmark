const hexchain = async s => {
  const [{ parse }, { default: Seed }, { mean, standardDeviation, median }, { default: Ajv }, { default: tbl }, { default: DOMPurify }] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom'),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv'),
    import('https://esm.sh/text-table'),
    import('https://esm.sh/dompurify')
  ]);
  const cfg = parse(s);
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
  const rng = new Seed(cfg.seed);
  const nums = Array.from({ length: cfg.count }, () => rng());
  const r = v => +v.toFixed(6);
  const m = r(mean(nums));
  const d = r(standardDeviation(nums));
  const e = r(median(nums));
  const ascii = tbl([['Stat', 'Value'], ['mean', String(m)], ['stddev', String(d)], ['median', String(e)]]);
  return {
    valid: true,
    label: cfg.label,
    stats: { mean: m, stddev: d, median: e },
    table: DOMPurify.sanitize('<pre class="stats">' + ascii + '</pre>'),
    count: cfg.count
  };
};
export default hexchain;
// Generation time: 147.472s
// Result: PASS