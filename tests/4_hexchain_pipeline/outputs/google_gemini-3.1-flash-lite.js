async function hexchain(tomlStr) {
  const [
    { parse },
    { default: seedrandom },
    { mean, standardDeviation, median },
    { default: Ajv },
    { default: table },
    { DOMPurify }
  ] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom'),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv'),
    import('https://esm.sh/text-table'),
    import('https://esm.sh/dompurify')
  ]);

  const config = parse(tomlStr);
  const ajv = new Ajv();
  const validate = ajv.compile({
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  });

  if (!validate(config)) return { valid: false, errors: ajv.errorsText(validate.errors) };

  const rng = new seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, rng);
  const round = n => +(n.toFixed(6));
  const stats = { mean: round(mean(nums)), stddev: round(standardDeviation(nums)), median: round(median(nums)) };
  
  const tbl = table([
    ['Stat', 'Value'],
    ['mean', String(stats.mean)],
    ['stddev', String(stats.stddev)],
    ['median', String(stats.median)]
  ]);

  return {
    valid: true,
    label: config.label,
    stats,
    table: DOMPurify.sanitize(`<pre class="stats">${tbl}</pre>`),
    count: config.count
  };
}
export default hexchain;
// Generation time: 1.959s
// Result: FAIL