async function hexchain(toml) {
  const [
    { parse },
    { default: seedrandom },
    { mean, standardDeviation, median },
    { default: Ajv },
    { default: textTable },
    { default: DOMPurify }
  ] = await Promise.all([
    import("https://esm.sh/smol-toml@1.3.1"),
    import("https://esm.sh/seedrandom@3.0.5"),
    import("https://esm.sh/simple-statistics@7.8.8"),
    import("https://esm.sh/ajv@8.17.1"),
    import("https://esm.sh/text-table@0.2.0"),
    import("https://esm.sh/dompurify@3.2.4")
  ]);

  const config = parse(toml);
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

  if (!ajv.validate(schema, config)) {
    return { valid: false, errors: ajv.errorsText() };
  }

  const rng = new seedrandom(config.seed);
  const numbers = Array.from({ length: config.count }, () => rng());
  const stats = {
    mean: Number(mean(numbers).toFixed(6)),
    stddev: Number(standardDeviation(numbers).toFixed(6)),
    median: Number(median(numbers).toFixed(6))
  };

  const tableString = textTable([
    ["Stat", "Value"],
    ["mean", String(stats.mean)],
    ["stddev", String(stats.stddev)],
    ["median", String(stats.median)]
  ]);

  const table = DOMPurify.sanitize(
    `<pre class="stats">${tableString}</pre>`
  );

  return {
    valid: true,
    label: config.label,
    stats,
    table,
    count: config.count
  };
}
export default hexchain;
// Generation time: 13.622s
// Result: PASS