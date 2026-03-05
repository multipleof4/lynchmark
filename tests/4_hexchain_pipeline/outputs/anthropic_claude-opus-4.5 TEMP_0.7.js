async function hexchain(tomlString) {
  const [
    { parse },
    seedrandom,
    ss,
    Ajv,
    table,
    DOMPurify
  ] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom').then(m => m.default),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv').then(m => m.default),
    import('https://esm.sh/text-table').then(m => m.default),
    import('https://esm.sh/dompurify').then(m => m.default)
  ]);

  const config = parse(tomlString);

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

  if (!ajv.validate(schema, config)) {
    return { valid: false, errors: ajv.errorsText() };
  }

  const rng = new seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());

  const r = n => Math.round(n * 1e6) / 1e6;
  const mean = r(ss.mean(nums));
  const stddev = r(ss.standardDeviation(nums));
  const median = r(ss.median(nums));

  const tableStr = table([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  const sanitizedHTML = DOMPurify.sanitize('<pre class="stats">' + tableStr + '</pre>');

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: sanitizedHTML,
    count: config.count
  };
}
export default hexchain;
// Generation time: 6.766s
// Result: PASS