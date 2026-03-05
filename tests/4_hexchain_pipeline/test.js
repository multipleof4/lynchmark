export default {
  functionName: 'hexchain',
  prompt: `// Write an async JavaScript function 'hexchain' that chains SIX CDN-loaded libraries in a single pipeline.
// - The function accepts a TOML string and returns an analysis object.
// - You MUST use dynamic import() to load ALL SIX of these libraries from CDNs:
//   1. 'smol-toml' — to parse the TOML input string into a JS object.
//   2. 'seedrandom' — to create a deterministic PRNG from config.seed. Use new seedrandom(config.seed).
//   3. 'simple-statistics' — to compute mean, standardDeviation, and median on the generated numbers.
//   4. 'ajv' (Ajv JSON Schema validator, use default export: new Ajv()) — to validate the parsed config against a schema BEFORE processing. The schema is:
//      { type:'object', required:['seed','count','label'], properties:{ seed:{type:'string'}, count:{type:'integer',minimum:1,maximum:10000}, label:{type:'string',minLength:1} } }
//      If validation fails, return { valid:false, errors: ajv.errorsText() }.
//   5. 'text-table' — to format the stats as an aligned ASCII table.
//   6. 'DOMPurify' — to sanitize a final HTML snippet wrapping the table.
//
// TOML format:
//   seed = "benchmark42"
//   count = 500
//   label = "TestRun"
//
// Pipeline steps:
//   1. Parse TOML with smol-toml → config object.
//   2. Validate config with Ajv against the schema above. If invalid, return early (see above).
//   3. Create a PRNG with seedrandom using config.seed. Generate config.count numbers by calling rng() repeatedly (each call returns a float in [0,1)).
//   4. Using simple-statistics, compute: mean, standardDeviation (population, i.e. the one named standardDeviation), and median of the generated array.
//   5. Round each stat to 6 decimal places.
//   6. Build a table array: header row ['Stat','Value'], then rows ['mean', String(mean)], ['stddev', String(stddev)], ['median', String(median)].
//      Pass to text-table to get an aligned ASCII string.
//   7. Wrap the table in HTML: '<pre class="stats">' + tableString + '</pre>' and sanitize with DOMPurify.sanitize().
//   8. Return { valid:true, label:config.label, stats:{ mean, stddev, median }, table: sanitizedHTML, count:config.count }.`,
  runTest: async (hexchain) => {
    const assert = {
      strictEqual: (a, e, m) => { if (a !== e) throw new Error(m || `FAIL: ${a} !== ${e}`) },
      ok: (v, m) => { if (!v) throw new Error(m) },
    };

    // Test 1: valid config
    const toml = `seed = "benchmark42"\ncount = 500\nlabel = "TestRun"`;
    const r = await hexchain(toml);

    assert.ok(r && typeof r === 'object', 'Should return an object');
    assert.strictEqual(r.valid, true, 'valid should be true');
    assert.strictEqual(r.label, 'TestRun', 'label mismatch');
    assert.strictEqual(r.count, 500, 'count mismatch');

    assert.ok(typeof r.stats === 'object', 'stats should be an object');
    assert.ok(typeof r.stats.mean === 'number', 'mean should be a number');
    assert.ok(typeof r.stats.stddev === 'number', 'stddev should be a number');
    assert.ok(typeof r.stats.median === 'number', 'median should be a number');

    // seedrandom('benchmark42') with 500 calls is deterministic; mean ≈ 0.5, stddev ≈ 0.29, median ≈ 0.5
    assert.ok(r.stats.mean > 0.4 && r.stats.mean < 0.6, `mean should be ~0.5, got ${r.stats.mean}`);
    assert.ok(r.stats.stddev > 0.2 && r.stats.stddev < 0.4, `stddev should be ~0.29, got ${r.stats.stddev}`);
    assert.ok(r.stats.median > 0.35 && r.stats.median < 0.65, `median should be ~0.5, got ${r.stats.median}`);

    // Verify determinism: run again, must get identical results
    const r2 = await hexchain(toml);
    assert.strictEqual(r.stats.mean, r2.stats.mean, 'mean must be deterministic');
    assert.strictEqual(r.stats.stddev, r2.stats.stddev, 'stddev must be deterministic');
    assert.strictEqual(r.stats.median, r2.stats.median, 'median must be deterministic');

    // Check table HTML
    assert.ok(typeof r.table === 'string', 'table should be a string');
    assert.ok(r.table.includes('<pre'), 'HTML should contain <pre> tag');
    assert.ok(r.table.includes('mean'), 'Table should contain mean');
    assert.ok(r.table.includes('stddev'), 'Table should contain stddev');
    assert.ok(r.table.includes('median'), 'Table should contain median');
    assert.ok(!r.table.includes('<script'), 'DOMPurify should strip scripts');

    // Test 2: invalid config (missing label)
    const badToml = `seed = "x"\ncount = 10`;
    const bad = await hexchain(badToml);
    assert.strictEqual(bad.valid, false, 'Should be invalid when label is missing');
    assert.ok(typeof bad.errors === 'string' && bad.errors.length > 0, 'Should return error string');
  }
};
