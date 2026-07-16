const CDN = 'https://esm.sh/';

async function hexchain(toml) {
  const [tomlM, seedM, ssM, ajvM, ttM, dpM] = await Promise.all(
    ['smol-toml@1', 'seedrandom@3', 'simple-statistics@7', 'ajv@8', 'text-table@0.2', 'dompurify@3']
      .map(p => import(CDN + p))
  );

  const config = tomlM.parse(toml);
  const ajv = new ajvM.default();
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

  const rng = new seedM.default(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());
  const r6 = x => Math.round(x * 1e6) / 1e6;
  const mean = r6(ssM.mean(nums));
  const stddev = r6(ssM.standardDeviation(nums));
  const median = r6(ssM.median(nums));

  const table = ttM.default([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  const dp = dpM.default ?? dpM;
  const purify = dp.sanitize ? dp : dp(window);

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: purify.sanitize('<pre class="stats">' + table + '</pre>'),
    count: config.count
  };
}
export default hexchain;
// Generation time: 84.644s
// Result: PASS