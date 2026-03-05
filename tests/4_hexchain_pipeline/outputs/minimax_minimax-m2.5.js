export async function hexchain(toml) {
  const [
    { default: parseToml },
    { default: SR },
    { default: ss },
    { default: Ajv },
    { default: tableFmt },
    { default: purify },
  ] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom'),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv'),
    import('https://esm.sh/text-table'),
    import('https://esm.sh/dompurify'),
  ]);

  const config = parseToml(toml);
  const ajv = new Ajv();
  const validate = ajv.compile({
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 },
    },
  });

  if (!validate(config))
    return { valid: false, errors: ajv.errorsText() };

  const rng = new SR(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());

  const mean = ss.mean(nums);
  const stddev = ss.standardDeviation(nums);
  const median = ss.median(nums);

  const r = (v) => Math.round(v * 1e6) / 1e6;
  const meanR = r(mean);
  const stddevR = r(stddev);
  const medianR = r(median);

  const table = tableFmt([
    ['Stat', 'Value'],
    ['mean', String(meanR)],
    ['stddev', String(stddevR)],
    ['median', String(medianR)],
  ]);

  const html = '<pre class="stats">' + table + '</pre>';

  return {
    valid: true,
    label: config.label,
    stats: { mean: meanR, stddev: stddevR, median: medianR },
    table: purify.sanitize(html),
    count: config.count,
  };
}
export default hexchain;
// Generation time: 139.541s
// Result: FAIL