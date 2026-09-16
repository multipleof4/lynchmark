async function hexchain(toml) {
  const { parse } = await import('https://cdn.jsdelivr.net/npm/smol-toml@1.0.1/+esm');
  const config = parse(toml);
  const Ajv = (await import('https://cdn.jsdelivr.net/npm/ajv@8.12.0/+esm')).default;
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
  if (!ajv.validate(schema, config)) return { valid: false, errors: ajv.errorsText() };
  const seedrandom = (await import('https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/+esm')).default;
  const rng = new seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());
  const { mean, standardDeviation, median } = await import('https://cdn.jsdelivr.net/npm/simple-statistics@7.8.3/+esm');
  const stats = {
    mean: +mean(nums).toFixed(6),
    stddev: +standardDeviation(nums).toFixed(6),
    median: +median(nums).toFixed(6)
  };
  const table = (await import('https://cdn.jsdelivr.net/npm/text-table@0.2.0/+esm')).default;
  const tableString = table([
    ['Stat', 'Value'],
    ['mean', String(stats.mean)],
    ['stddev', String(stats.stddev)],
    ['median', String(stats.median)]
  ]);
  const DOMPurify = (await import('https://cdn.jsdelivr.net/npm/dompurify@3.0.6/+esm')).default;
  return {
    valid: true,
    label: config.label,
    stats,
    table: DOMPurify.sanitize('<pre class="stats">' + tableString + '</pre>'),
    count: config.count
  };
}
export default hexchain;
// Generation time: 164.666s
// Result: PASS