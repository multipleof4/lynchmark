async function hexchain(tomlStr) {
  const [{ parse }, { default: seedrandom }, ss, { default: Ajv }, { default: table }, { default: DOMPurify }] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/seedrandom'),
    import('https://esm.sh/simple-statistics'),
    import('https://esm.sh/ajv'),
    import('https://esm.sh/text-table'),
    import('https://esm.sh/dompurify')
  ])
  const config = parse(tomlStr)
  const ajv = new Ajv()
  if (!ajv.validate({
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  }, config)) return { valid: false, errors: ajv.errorsText() }
  const rng = new seedrandom(config.seed)
  const nums = Array.from({ length: config.count }, () => rng())
  const mean = +ss.mean(nums).toFixed(6)
  const stddev = +ss.standardDeviation(nums).toFixed(6)
  const median = +ss.median(nums).toFixed(6)
  const tableStr = table([
    ['Stat', 'Value'],
    ['mean', String(mean)],
    ['stddev', String(stddev)],
    ['median', String(median)]
  ])
  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: DOMPurify.sanitize(`<pre class="stats">${tableStr}</pre>`),
    count: config.count
  }
}
export default hexchain;
// Generation time: 101.900s
// Result: PASS