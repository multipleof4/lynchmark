async function hexchain(tomlStr) {
  const [
    { parse },
    { default: SR },
    { mean, standardDeviation, median },
    { default: Ajv },
    { default: table },
    { default: purify }
  ] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom'),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv'),
    import('https://esm.sh/text-table'),
    import('https://esm.sh/dompurify')
  ]);

  const config = parse(tomlStr),
    ajv = new Ajv(),
    schema = {
      type: 'object',
      required: ['seed', 'count', 'label'],
      properties: {
        seed: { type: 'string' },
        count: { type: 'integer', minimum: 1, maximum: 10000 },
        label: { type: 'string', minLength: 1 }
      }
    };

  if (!ajv.validate(schema, config)) 
    return { valid: false, errors: ajv.errorsText() };

  const rng = new SR(config.seed),
    data = Array.from({ length: config.count }, rng),
    stats = {
      mean: +mean(data).toFixed(6),
      stddev: +standardDeviation(data).toFixed(6),
      median: +median(data).toFixed(6)
    },
    tbl = table([
      ['Stat', 'Value'],
      ['mean', String(stats.mean)],
      ['stddev', String(stats.stddev)],
      ['median', String(stats.median)]
    ]),
    sanitized = purify.sanitize(`<pre class="stats">${tbl}</pre>`);

  return { 
    valid: true, 
    label: config.label, 
    stats, 
    table: sanitized, 
    count: config.count 
  };
}
export default hexchain;
// Generation time: 2.335s
// Result: PASS