async function hexchain(tomlString) {
    const cdn = 'https://esm.sh/';
    const toml = await import(cdn + 'smol-toml');
    const { default: seedrandom } = await import(cdn + 'seedrandom');
    const ss = await import(cdn + 'simple-statistics');
    const Ajv = (await import(cdn + 'ajv')).default;
    const tt = await import(cdn + 'text-table');
    const DOMPurify = await import(cdn + 'dompurify');

    const config = toml.parse(tomlString);
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

    const rng = seedrandom(config.seed);
    const numbers = Array.from({ length: config.count }, () => rng());
    const mean = parseFloat(ss.mean(numbers).toFixed(6));
    const stddev = parseFloat(ss.standardDeviation(numbers).toFixed(6));
    const median = parseFloat(ss.median(numbers).toFixed(6));

    const tableArray = [
        ['Stat', 'Value'],
        ['mean', mean.toString()],
        ['stddev', stddev.toString()],
        ['median', median.toString()]
    ];

    const tableString = tt.default(tableArray);
    const html = `<pre class="stats">${tableString}</pre>`;
    const sanitizedHTML = DOMPurify.sanitize(html);

    return {
        valid: true,
        label: config.label,
        stats: { mean, stddev, median },
        table: sanitizedHTML,
        count: config.count
    };
}
export default hexchain;
// Generation time: 15.489s
// Result: FAIL