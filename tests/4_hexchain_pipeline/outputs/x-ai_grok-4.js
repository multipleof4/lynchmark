async function hexchain(tomlStr) {
  const {parse} = await import('https://esm.sh/smol-toml');
  const config = parse(tomlStr);
  const Ajv = (await import('https://esm.sh/ajv')).default;
  const ajv = new Ajv();
  const schema = {type:'object', required:['seed','count','label'], properties:{seed:{type:'string'}, count:{type:'integer',minimum:1,maximum:10000}, label:{type:'string',minLength:1}}};
  if (!ajv.validate(schema, config)) return {valid:false, errors: ajv.errorsText()};
  const seedrandom = (await import('https://esm.sh/seedrandom')).default;
  const rng = new seedrandom(config.seed);
  const nums = Array.from({length: config.count}, () => rng());
  const ss = await import('https://esm.sh/simple-statistics');
  let mean = ss.mean(nums);
  let stddev = ss.standardDeviation(nums);
  let median = ss.median(nums);
  mean = Math.round(mean * 1e6) / 1e6;
  stddev = Math.round(stddev * 1e6) / 1e6;
  median = Math.round(median * 1e6) / 1e6;
  const textTable = (await import('https://esm.sh/text-table')).default;
  const tableArr = [['Stat','Value'], ['mean', String(mean)], ['stddev', String(stddev)], ['median', String(median)]];
  const tableStr = textTable(tableArr);
  const DOMPurify = (await import('https://esm.sh/dompurify')).default;
  const html = '<pre class="stats">' + tableStr + '</pre>';
  const sanitized = DOMPurify.sanitize(html);
  return {valid:true, label:config.label, stats:{mean, stddev, median}, table: sanitized, count:config.count};
}
export default hexchain;
// Generation time: 130.290s
// Result: PASS