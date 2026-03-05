async function hexchain(toml) {
  const [{ parse }, { default: seedrandom }, ss, { default: Ajv }, { default: table }, { default: DOMPurify }] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom'),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv'),
    import('https://esm.sh/text-table'),
    import('https://esm.sh/dompurify')
  ]);

  const config = parse(toml);
  const schema = { type: 'object', required: ['seed', 'count', 'label'], properties: { seed: { type: 'string' }, count: { type: 'integer', minimum: 1, maximum: 10000 }, label: { type: 'string', minLength: 1 } } };
  const ajv = new Ajv();

  if (!ajv.validate(schema, config)) return { valid: false, errors: ajv.errorsText() };

  const rng = seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());
  const r = n => Math.round(n * 1e6) / 1e6;
  const mean = r(ss.mean(nums)), stddev = r(ss.standardDeviation(nums)), median = r(ss.median(nums));

  const t = table([['Stat', 'Value'], ['mean', String(mean)], ['stddev', String(stddev)], ['median', String(median)]]);
  return { valid: true, label: config.label, stats: { mean, stddev, median }, table: DOMPurify.sanitize(`<pre class="stats">${t}</pre>`), count: config.count };
}
export default hexchain;
// Generation time: 132.298s
// Result: PASS