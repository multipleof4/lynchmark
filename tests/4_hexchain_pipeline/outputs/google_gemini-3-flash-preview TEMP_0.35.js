export async function hexchain(tomlInput) {
  const [
    { parse },
    { default: SeedRandom },
    ss,
    { default: Ajv },
    { default: table },
    { default: DOMPurify }
  ] = await Promise.all([
    import('https://cdn.skypack.dev/smol-toml'),
    import('https://cdn.skypack.dev/seedrandom'),
    import('https://cdn.skypack.dev/simple-statistics'),
    import('https://cdn.skypack.dev/ajv'),
    import('https://cdn.skypack.dev/text-table'),
    import('https://cdn.skypack.dev/dompurify')
  ]);

  const config = parse(tomlInput);
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

  const rng = new SeedRandom(config.seed);
  const data = Array.from({ length: config.count }, () => rng());

  const stats = {
    mean: ss.mean(data).toFixed(6),
    stddev: ss.standardDeviation(data).toFixed(6),
    median: ss.median(data).toFixed(6)
  };

  const rows = [
    ['Stat', 'Value'],
    ['mean', stats.mean],
    ['stddev', stats.stddev],
    ['median', stats.median]
  ];

  const tableStr = table(rows);
  const html = `<pre class="stats">${tableStr}</pre>`;

  return {
    valid: true,
    label: config.label,
    stats: Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, Number(v)])),
    table: DOMPurify.sanitize(html),
    count: config.count
  };
}
export default hexchain;
// Generation time: 4.172s
// Result: FAIL