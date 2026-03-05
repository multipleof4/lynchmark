
  const [
    { parse },
    seedrandom,
    stats,
    Ajv,
    textTable,
    { default: DOMPurify }
  ] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml@1/dist/index.mjs'),
    import('https://cdn.jsdelivr.net/npm/seedrandom@3/+esm').then(m => m.default),
    import('https://cdn.jsdelivr.net/npm/simple-statistics@7/+esm'),
    import('https://cdn.jsdelivr.net/npm/ajv@8/dist/ajv.min.js').then(m => m.default),
    import('https://cdn.jsdelivr.net/npm/text-table@0.2.0/+esm').then(m => m.default),
    import('https://cdn.jsdelivr.net/npm/dompurify@3/+esm')
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
  const numbers = Array.from({ length: config.count }, () => rng());

  const mean = +stats.mean(numbers).toFixed(6);
  const stddev = +stats.standardDeviation(numbers).toFixed(6);
  const median = +stats.median(numbers).toFixed(6);

  const tableString = textTable([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  const sanitizedHTML = DOMPurify.sanitize(`<pre class="stats">${tableString}</pre>`);

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: sanitizedHTML,
    count: config.count
  };
}
export default hexchain;
// Generation time: 6.949s
// Result: FAIL