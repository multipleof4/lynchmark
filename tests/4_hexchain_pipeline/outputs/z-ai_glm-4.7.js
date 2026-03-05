const hexchain = async (tomlStr) => {
  const [
    { default: parseToml },
    { default: seedrandom },
    ss,
    { default: Ajv },
    { default: textTable },
    { default: DOMPurify }
  ] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom'),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv'),
    import('https://esm.sh/text-table'),
    import('https://esm.sh/dompurify')
  ]);

  const config = parseToml(tomlStr);
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
  const numbers = Array.from({ length: config.count }, rng);

  const [mean, stddev, median] = [
    ss.mean(numbers),
    ss.standardDeviation(numbers),
    ss.median(numbers)
  ].map(n => parseFloat(n.toFixed(6)));

  const tableStr = textTable([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ]);

  const cleanHTML = DOMPurify.sanitize(`<pre class="stats">${tableStr}</pre>`);

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: cleanHTML,
    count: config.count
  };
};
export default hexchain;
// Generation time: 53.399s
// Result: FAIL