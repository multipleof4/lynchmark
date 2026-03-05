export async function hexchain(toml) {
  const [
    { parse },
    { default: SeedRandom },
    ss,
    { default: Ajv },
    { default: textTable },
    domPurifyMod
  ] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml/+esm'),
    import('https://cdn.jsdelivr.net/npm/seedrandom/+esm'),
    import('https://cdn.jsdelivr.net/npm/simple-statistics/+esm'),
    import('https://cdn.jsdelivr.net/npm/ajv/+esm'),
    import('https://cdn.jsdelivr.net/npm/text-table/+esm'),
    import('https://cdn.jsdelivr.net/npm/dompurify/+esm')
  ]);

  const config = parse(toml);
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
  const valid = ajv.validate(schema, config);

  if (!valid) {
    return { valid: false, errors: ajv.errorsText() };
  }

  const rng = new SeedRandom(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());
  const round = n => +n.toFixed(6);
  const mean = round(ss.mean(nums));
  const stddev = round(ss.standardDeviation(nums));
  const median = round(ss.median(nums));
  const table = textTable([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  const DOMPurify = domPurifyMod.default || domPurifyMod;
  const sanitizedHTML = DOMPurify.sanitize(`<pre class="stats">${table}</pre>`);

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: sanitizedHTML,
    count: config.count
  };
}
export default hexchain;
// Generation time: 5.200s
// Result: PASS