const hexchain = async (t) => {
  const [{ parse }, { default: R }, S, { default: A }, { default: T }, { default: D }] = await Promise.all([
    import('https://esm.run/smol-toml'),
    import('https://esm.run/seedrandom'),
    import('https://esm.run/simple-statistics'),
    import('https://esm.run/ajv'),
    import('https://esm.run/text-table'),
    import('https://esm.run/dompurify')
  ]);
  const c = parse(t);
  const s = { type:'object', required:['seed','count','label'], properties:{ seed:{type:'string'}, count:{type:'integer',minimum:1,maximum:10000}, label:{type:'string',minLength:1} } };
  const a = new A();
  if (!a.validate(s, c)) return { valid:false, errors: a.errorsText() };
  const r = R(c.seed);
  const n = Array.from({ length: c.count }, r);
  const m = +S.mean(n).toFixed(6);
  const d = +S.standardDeviation(n).toFixed(6);
  const e = +S.median(n).toFixed(6);
  const tb = T([['Stat','Value'],['mean',m.toFixed(6)],['stddev',d.toFixed(6)],['median',e.toFixed(6)]]);
  const h = D.sanitize(`<pre class="stats">${tb}</pre>`);
  return { valid:true, label:c.label, stats:{ mean:m, stddev:d, median:e }, table:h, count:c.count };
};
export default hexchain;
// Generation time: 76.627s
// Result: PASS