async function hexchain(toml) {
  const [{parse}, {default: seedrandom}, ss, {default: Ajv}, textTable, {default: DOMPurify}] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/smol-toml@1.3.0/+esm'),
    import('https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/+esm'),
    import('https://cdn.jsdelivr.net/npm/simple-statistics@7.8.3/+esm'),
    import('https://cdn.jsdelivr.net/npm/ajv@8.17.1/+esm'),
    import('https://cdn.jsdelivr.net/npm/text-table@0.2.0/+esm'),
    import('https://cdn.jsdelivr.net/npm/dompurify@3.2.4/+esm')
  ]);

  const config = parse(toml);
  const schema = {type:"object",required:["seed","count","label"],properties:{seed:{type:"string"},count:{type:"integer",minimum:1,maximum:10000},label:{type:"string",minLength:1}}};
  const ajv = new Ajv();
  if (!ajv.validate(schema, config)) return {valid:false,errors:ajv.errorsText()};

  const rng = new seedrandom(config.seed);
  const nums = Array.from({length:config.count},rng);

  const mean = +ss.mean(nums).toFixed(6);
  const stddev = +ss.standardDeviation(nums).toFixed(6);
  const median = +ss.median(nums).toFixed(6);

  const table = textTable([
    ["Stat","Value"],
    ["mean",String(mean)],
    ["stddev",String(stddev)],
    ["median",String(median)]
  ]);

  const html = DOMPurify.sanitize('<pre class="stats">'+table+'</pre>');

  return {valid:true,label:config.label,stats:{mean,stddev,median},table:html,count:config.count};
}
export default hexchain;
// Generation time: 2.026s
// Result: FAIL