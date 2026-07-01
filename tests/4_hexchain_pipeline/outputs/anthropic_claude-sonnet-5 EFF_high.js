const CDN = {
  toml: 'https://esm.sh/smol-toml@1',
  seedrandom: 'https://esm.sh/seedrandom@3',
  stats: 'https://esm.sh/simple-statistics@7',
  ajv: 'https://esm.sh/ajv@8',
  table: 'https://esm.sh/text-table@1',
  dompurify: 'https://esm.sh/dompurify@3',
};

const SCHEMA = {
  type: 'object',
  required: ['seed', 'count', 'label'],
  properties: {
    seed: { type: 'string' },
    count: { type: 'integer', minimum: 1, maximum: 10000 },
    label: { type: 'string', minLength: 1 },
  },
};

const round6 = n => Math.round(n * 1e6) / 1e6;

async function hexchain(tomlStr) {
  const [{ parse }, seedrandomMod, ss, AjvMod, tableMod, DOMPurify] = await Promise.all([
    import(CDN.toml),
    import(CDN.seedrandom),
    import(CDN.stats),
    import(CDN.ajv),
    import(CDN.table),
    import(CDN.dompurify),
  ]);

  const seedrandom = seedrandomMod.default;
  const Ajv = AjvMod.default;
  const table = tableMod.default;
  const purify = DOMPurify.default ?? DOMPurify;

  const config = parse(tomlStr);

  const ajv = new Ajv();
  const validate = ajv.compile(SCHEMA);
  if (!validate(config)) {
    return { valid: false, errors: ajv.errorsText(validate.errors) };
  }

  const rng = new seedrandom(config.seed);
  const numbers = Array.from({ length: config.count }, () => rng());

  const mean = round6(ss.mean(numbers));
  const stddev = round6(ss.standardDeviation(numbers));
  const median = round6(ss.median(numbers));

  const rows = [
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)],
  ];
  const tableStr = table(rows);

  const rawHtml = `<pre class="stats">${tableStr}</pre>`;
  const sanitizedHtml = purify.sanitize(rawHtml);

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: sanitizedHtml,
    count: config.count,
  };
}
export default hexchain;
// Generation time: 10.215s
// Result: FAIL