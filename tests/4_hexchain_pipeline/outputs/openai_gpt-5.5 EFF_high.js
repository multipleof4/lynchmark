const hexchainUrls = [
  'https://esm.sh/smol-toml?bundle',
  'https://esm.sh/seedrandom?bundle',
  'https://esm.sh/simple-statistics?bundle',
  'https://esm.sh/ajv?bundle',
  'https://esm.sh/text-table?bundle',
  'https://esm.sh/dompurify?bundle'
];

const hexchainSchema = {
  type: 'object',
  required: ['seed', 'count', 'label'],
  properties: {
    seed: { type: 'string' },
    count: { type: 'integer', minimum: 1, maximum: 10000 },
    label: { type: 'string', minLength: 1 }
  }
};

let hexchainModules;

async function hexchain(tomlString) {
  const [
    toml,
    seedMod,
    ssMod,
    ajvMod,
    tableMod,
    purifyMod
  ] = await (hexchainModules ||= Promise.all(hexchainUrls.map(u => import(u))));

  const parse = toml.parse ?? toml.default?.parse ?? toml.default;
  const seedrandom = seedMod.default ?? seedMod;
  const ss = ssMod.mean ? ssMod : ssMod.default;
  const Ajv = ajvMod.default ?? ajvMod.Ajv;
  const textTable = tableMod.default ?? tableMod;
  const purify = purifyMod.default ?? purifyMod;
  const DOMPurify = purify.sanitize ? purify : purify(globalThis);
  const config = parse(tomlString);
  const ajv = new Ajv();

  if (!ajv.validate(hexchainSchema, config))
    return { valid: false, errors: ajv.errorsText() };

  const rng = new seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());
  const round = n => Math.round((n + Number.EPSILON) * 1e6) / 1e6;
  const mean = round(ss.mean(nums));
  const stddev = round(ss.standardDeviation(nums));
  const median = round(ss.median(nums));
  const tableString = textTable([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: DOMPurify.sanitize('<pre class="stats">' + tableString + '</pre>'),
    count: config.count
  };
}

globalThis.hexchain = hexchain;
export default hexchain;
// Generation time: 137.860s
// Result: PASS