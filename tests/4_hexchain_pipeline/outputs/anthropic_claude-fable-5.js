const load = name => import(`https://esm.sh/${name}`);

async function hexchain(tomlString) {
  const [
    { parse },
    { default: seedrandom },
    ss,
    { default: Ajv },
    { default: table },
    { default: DOMPurify }
  ] = await Promise.all(
    ['smol-toml', 'seedrandom', 'simple-statistics', 'ajv', 'text-table', 'dompurify'].map(load)
  );

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

  if (!ajv.validate(schema, config)) return { valid: false, errors: ajv.errorsText() };

  const rng = new seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());
  const round6 = x => Math.round(x * 1e6) / 1e6;
  const [mean, stddev, median] = [ss.mean, ss.standardDeviation, ss.median].map(f => round6(f(nums)));

  const ascii = table([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: DOMPurify.sanitize(`<pre class="stats">${ascii}</pre>`),
    count: config.count
  };
}
export default hexchain;
// Generation time: 14.324s
// Result: PASS