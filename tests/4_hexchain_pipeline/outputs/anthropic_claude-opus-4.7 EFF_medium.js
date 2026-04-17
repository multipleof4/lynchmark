const hexchain = async toml => {
    const CDN = 'https://esm.sh/';
    const [
        {parse},
        {default: seedrandom},
        ss,
        {default: Ajv},
        {default: table},
        {default: DOMPurify}
    ] = await Promise.all([
        import(`${CDN}smol-toml`),
        import(`${CDN}seedrandom`),
        import(`${CDN}simple-statistics`),
        import(`${CDN}ajv`),
        import(`${CDN}text-table`),
        import(`${CDN}dompurify`)
    ]);

    const config = parse(toml);
    const schema = {
        type: 'object',
        required: ['seed', 'count', 'label'],
        properties: {
            seed: {type: 'string'},
            count: {type: 'integer', minimum: 1, maximum: 10000},
            label: {type: 'string', minLength: 1}
        }
    };
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    if (!validate(config)) return {valid: false, errors: ajv.errorsText(validate.errors)};

    const rng = new seedrandom(config.seed);
    const nums = Array.from({length: config.count}, () => rng());
    const r = n => Math.round(n * 1e6) / 1e6;
    const mean = r(ss.mean(nums));
    const stddev = r(ss.standardDeviation(nums));
    const median = r(ss.median(nums));

    const tableStr = table([
        ['Stat', 'Value'],
        ['mean', String(mean)],
        ['stddev', String(stddev)],
        ['median', String(median)]
    ]);
    const sanitized = DOMPurify.sanitize(`<pre class="stats">${tableStr}</pre>`);

    return {
        valid: true,
        label: config.label,
        stats: {mean, stddev, median},
        table: sanitized,
        count: config.count
    };
};
export default hexchain;
// Generation time: 8.530s
// Result: PASS