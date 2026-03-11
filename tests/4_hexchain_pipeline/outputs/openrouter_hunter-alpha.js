const hexchain = async (toml) => {
  const [smolToml, seedrandom, ss, Ajv, textTable, DOMPurify] = await Promise.all([
    import('https://unpkg.com/smol-toml@1.0.0/index.js'),
    import('https://unpkg.com/seedrandom@3.0.5/lib/alea.js'),
    import('https://unpkg.com/simple-statistics@7.8.7/dist/simple-statistics.js'),
    import('https://unpkg.com/ajv@8.12.0/dist/ajv7.min.js'),
    import('https://unpkg.com/text-table@0.2.0/index.js'),
    import('https://unpkg.com/dompurify@3.0.8/dist/purify.js')
  ]);

  const config = smolToml.parse(toml);
  const ajv = new Ajv.default();
  const valid = ajv.validate({
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  }, config);

  if (!valid) return { valid: false, errors: ajv.errorsText() };

  const rng = seedrandom(config.seed);
  const numbers = Array.from({ length: config.count }, () => rng());

  const [mean, stddev, median] = [
    ss.mean(numbers),
    ss.standardDeviation(numbers),
    ss.median(numbers)
  ].map(v => parseFloat(v.toFixed(6)));

  const table = textTable.default([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  const sanitized = DOMPurify.sanitize(
    '<pre class="stats">' + table + '</pre>'
  );

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: sanitized,
    count: config.count
  };
};
export default hexchain;
// Generation time: 19.496s
// Result: FAIL