const hexchain = async (tomlInput) => {
  const [
    { parse },
    { default: SeedRandom },
    Stats,
    { default: Ajv },
    { default: textTable },
    { default: DOMPurifyFactory }
  ] = await Promise.all([
    'smol-toml', 'seedrandom', 'simple-statistics', 'ajv', 'text-table', 'dompurify'
  ].map(lib => import(`https://esm.sh/${lib}`)));

  const config = parse(tomlInput), ajv = new Ajv();
  const validate = ajv.compile({
    type: 'object', required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  });

  if (!validate(config)) return { valid: false, errors: ajv.errorsText(validate.errors) };

  const rng = new SeedRandom(config.seed);
  const data = Array.from({ length: config.count }, rng);
  const fmt = n => Number(n.toFixed(6));
  
  const stats = {
    mean: fmt(Stats.mean(data)),
    stddev: fmt(Stats.standardDeviation(data)),
    median: fmt(Stats.median(data))
  };

  const tableString = textTable([
    ['Stat', 'Value'],
    ['mean', String(stats.mean)],
    ['stddev', String(stats.stddev)],
    ['median', String(stats.median)]
  ]);

  const sanitizer = DOMPurifyFactory.sanitize ? DOMPurifyFactory : DOMPurifyFactory(window);
  const html = sanitizer.sanitize(`<pre class="stats">${tableString}</pre>`);

  return { valid: true, label: config.label, stats, table: html, count: config.count };
};
export default hexchain;
// Generation time: 62.534s
// Result: PASS