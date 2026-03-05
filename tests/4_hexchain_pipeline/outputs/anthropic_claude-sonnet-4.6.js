async function hexchain(tomlString) {
  const [
    { parse },
    { default: seedrandom },
    ss,
    { default: Ajv },
    { default: textTable },
    { default: DOMPurify },
  ] = await Promise.all([
    import("https://esm.sh/smol-toml"),
    import("https://esm.sh/seedrandom"),
    import("https://esm.sh/simple-statistics"),
    import("https://esm.sh/ajv"),
    import("https://esm.sh/text-table"),
    import("https://esm.sh/dompurify"),
  ]);

  const config = parse(tomlString);

  const ajv = new Ajv();
  const validate = ajv.compile({
    type: "object",
    required: ["seed", "count", "label"],
    properties: {
      seed: { type: "string" },
      count: { type: "integer", minimum: 1, maximum: 10000 },
      label: { type: "string", minLength: 1 },
    },
  });

  if (!validate(config)) {
    return { valid: false, errors: ajv.errorsText(validate.errors) };
  }

  const rng = new seedrandom(config.seed);
  const numbers = Array.from({ length: config.count }, () => rng());

  const round6 = (n) => Math.round(n * 1e6) / 1e6;
  const mean = round6(ss.mean(numbers));
  const stddev = round6(ss.standardDeviation(numbers));
  const median = round6(ss.median(numbers));

  const tableString = textTable([
    ["Stat", "Value"],
    ["mean", String(mean)],
    ["stddev", String(stddev)],
    ["median", String(median)],
  ]);

  const sanitizedHTML = DOMPurify.sanitize(
    `<pre class="stats">${tableString}</pre>`
  );

  return {
    valid: true,
    label: config.label,
    stats: { mean, stddev, median },
    table: sanitizedHTML,
    count: config.count,
  };
}
export default hexchain;
// Generation time: 5.576s
// Result: PASS