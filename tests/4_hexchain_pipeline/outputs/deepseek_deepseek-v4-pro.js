async function hexchain(t){
  const [T,S,SS,A,B,P]=await Promise.all([
    import('smol-toml'),
    import('seedrandom'),
    import('simple-statistics'),
    import('ajv'),
    import('text-table'),
    import('dompurify')
  ]);
  const c=T.parse(t);
  const Ajv=A.default||A,ajv=new Ajv;
  const schema={
    type:'object',
    required:['seed','count','label'],
    properties:{
      seed:{type:'string'},
      count:{type:'integer',minimum:1,maximum:10000},
      label:{type:'string',minLength:1}
    }
  };
  const v=ajv.compile(schema);
  if(!v(c))return{valid:false,errors:ajv.errorsText(v.errors)};
  const rng=new (S.default||S)(c.seed),
        arr=Array.from({length:c.count},rng);
  const ss=SS.default||SS;
  let m=ss.mean(arr),d=ss.standardDeviation(arr),md=ss.median(arr);
  m=+m.toFixed(6);
  d=+d.toFixed(6);
  md=+md.toFixed(6);
  const tbl=(B.default||B)([
    ['Stat','Value'],
    ['mean',String(m)],
    ['stddev',String(d)],
    ['median',String(md)]
  ]);
  const purify=P.default||P,
        h=purify.sanitize(`<pre class="stats">${tbl}</pre>`);
  return{
    valid:true,
    label:c.label,
    stats:{mean:m,stddev:d,median:md},
    table:h,
    count:c.count
  };
}
export default hexchain;
// Generation time: 121.732s
// Result: FAIL