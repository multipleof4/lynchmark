const hexchain = async (toml) => {
  const [tm, sd, ss, am, tt, pm] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom'),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv'),
    import('https://esm.sh/text-table'),
    import('https://esm.sh/dompurify')
  ]);

  const parse = tm.parse;
  const seedrandom = sd.default;
  const Ajv = am.default;
  const table = tt.default;
  const DOMPurify = pm.default;

  const config = parse(toml);
  const schema = {
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  };

  const ajv = new Ajv();
  if (!ajv.validate(schema, config)) return { valid: false, errors: ajv.errorsText() };

  const rng = seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, rng);
  const round = (x) => Math.round(x * 1e6) / 1e6;

  const mean = round(ss.mean(nums));
  const stddev = round(ss.standardDeviation(nums));
  const median = round(ss.median(nums));

  const tbl = table([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  const clean = DOMPurify.sanitize('<pre class="stats">' + tbl + '</pre>');

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: clean,
    count: config.count
  };
};
export default hexchain;
// Generation time: 69.982s
// Result: PASS