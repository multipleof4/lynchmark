export async function hexchain(tomlStr) {
  const [
    { parse },
    { default: Seed },
    { mean: ssM, standardDeviation: ssS, median: ssMed },
    { default: Ajv },
    { default: tbl },
    { default: pur }
  ] = await Promise.all([
    'smol-toml', 'seedrandom', 'simple-statistics', 'ajv', 'text-table', 'dompurify'
  ].map(n => import(`https://esm.sh/${n}`)));

  const cfg = parse(tomlStr);
  const ajv = new Ajv();

  if (!ajv.validate({
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  }, cfg)) {
    return { valid: false, errors: ajv.errorsText() };
  }

  const rng = new Seed(cfg.seed);
  const nums = Array.from({ length: cfg.count }, () => rng());
  const [mean, stddev, median] = [ssM, ssS, ssMed].map(f => +f(nums).toFixed(6));

  const tableStr = tbl([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  return {
    valid: true,
    label: cfg.label,
    stats: { mean, stddev, median },
    table: pur.sanitize(`<pre class="stats">${tableStr}</pre>`),
    count: cfg.count
  };
}
export default hexchain;
// Generation time: 27.764s
// Result: PASS