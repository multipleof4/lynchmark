async function hexchain(tomlString) {
  const [
    { parse },
    seedrandomMod,
    ss,
    AjvMod,
    textTable,
    DOMPurify
  ] = await Promise.all([
    import("https://cdn.jsdelivr.net/npm/smol-toml/+esm"),
    import("https://cdn.jsdelivr.net/npm/seedrandom/+esm"),
    import("https://cdn.jsdelivr.net/npm/simple-statistics/+esm"),
    import("https://cdn.jsdelivr.net/npm/ajv/+esm"),
    import("https://cdn.jsdelivr.net/npm/text-table/+esm"),
    import("https://cdn.jsdelivr.net/npm/dompurify/+esm")
  ]);

  const config = parse(tomlString);

  const Ajv = AjvMod.default || AjvMod;
  const ajv = new Ajv();
  const schema = {
    type: "object",
    required: ["seed", "count", "label"],
    properties: {
      seed: { type: "string" },
      count: { type: "integer", minimum: 1, maximum: 10000 },
      label: { type: "string", minLength: 1 }
    }
  };
  const valid = ajv.validate(schema, config);
  if (!valid) return { valid: false, errors: ajv.errorsText() };

  const seedrandom = seedrandomMod.default || seedrandomMod;
  const rng = new seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());

  const round6 = v => Math.round(v * 1e6) / 1e6;
  const mean = round6(ss.mean(nums));
  const stddev = round6(ss.standardDeviation(nums));
  const median = round6(ss.median(nums));

  const table = textTable.default || textTable;
  const tableString = table([
    ["Stat", "Value"],
    ["mean", String(mean)],
    ["stddev", String(stddev)],
    ["median", String(median)]
  ]);

  const purify = DOMPurify.default || DOMPurify;
  const sanitize = purify.sanitize || purify;
  const sanitizedHTML = (typeof sanitize === "function" ? sanitize : purify.sanitize).call(purify, '<pre class="stats">' + tableString + "</pre>");

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: sanitizedHTML,
    count: config.count
  };
}
export default hexchain;
// Generation time: 8.641s
// Result: PASS