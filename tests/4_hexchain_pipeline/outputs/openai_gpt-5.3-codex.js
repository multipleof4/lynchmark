async function hexchain(tomlString) {
  try {
    const [
      tomlMod,
      seedMod,
      statsMod,
      ajvMod,
      tableMod,
      purifyMod
    ] = await Promise.all([
      import("https://cdn.jsdelivr.net/npm/smol-toml@1.3.1/+esm"),
      import("https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/+esm"),
      import("https://cdn.jsdelivr.net/npm/simple-statistics@7.8.8/+esm"),
      import("https://cdn.jsdelivr.net/npm/ajv@8.17.1/+esm"),
      import("https://cdn.jsdelivr.net/npm/text-table@0.2.0/+esm"),
      import("https://cdn.jsdelivr.net/npm/dompurify@3.1.6/+esm")
    ]);

    const parseToml = tomlMod.parse ?? tomlMod.default?.parse ?? tomlMod.default;
    const SeedRandom = seedMod.default ?? seedMod.seedrandom ?? seedMod;
    const stats = statsMod.default ?? statsMod;
    const table = tableMod.default ?? tableMod;
    const Ajv = ajvMod.default ?? ajvMod.Ajv ?? ajvMod;

    let DOMPurify = purifyMod.default ?? purifyMod;
    if (typeof DOMPurify === "function" && !DOMPurify.sanitize) DOMPurify = DOMPurify(window);

    const config = parseToml(tomlString);
    const schema = {
      type: "object",
      required: ["seed", "count", "label"],
      properties: {
        seed: { type: "string" },
        count: { type: "integer", minimum: 1, maximum: 10000 },
        label: { type: "string", minLength: 1 }
      }
    };

    const ajv = new Ajv();
    if (!ajv.validate(schema, config)) return { valid: false, errors: ajv.errorsText() };

    const rng = new SeedRandom(config.seed);
    const numbers = Array.from({ length: config.count }, () => rng());
    const round = n => Number(n.toFixed(6));

    const mean = round(stats.mean(numbers));
    const stddev = round(stats.standardDeviation(numbers));
    const median = round(stats.median(numbers));

    const tableString = table([
      ["Stat", "Value"],
      ["mean", String(mean)],
      ["stddev", String(stddev)],
      ["median", String(median)]
    ]);

    const sanitizedHTML = DOMPurify.sanitize(`<pre class="stats">${tableString}</pre>`);

    return {
      valid: true,
      label: config.label,
      stats: { mean, stddev, median },
      table: sanitizedHTML,
      count: config.count
    };
  } catch (e) {
    return { valid: false, errors: e?.message || String(e) };
  }
}
export default hexchain;
// Generation time: 30.390s
// Result: PASS