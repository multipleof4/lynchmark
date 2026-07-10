async function hexchain(t){
const[{parse},sr,ss,Ajv,tt,DP]=await Promise.all([
import('https://esm.sh/smol-toml'),
import('https://esm.sh/seedrandom').then(m=>m.default),
import('https://esm.sh/simple-statistics'),
import('https://esm.sh/ajv').then(m=>m.default),
import('https://esm.sh/text-table').then(m=>m.default),
import('https://esm.sh/dompurify').then(m=>m.default)
]);
const c=parse(t);
const a=new Ajv();
const s={type:'object',required:['seed','count','label'],properties:{seed:{type:'string'},count:{type:'integer',minimum:1,maximum:10000},label:{type:'string',minLength:1}}};
if(!a.validate(s,c))return{valid:false,errors:a.errorsText()};
const r=sr(c.seed),n=[];
for(let i=0;i<c.count;i++)n.push(r());
const mean=+ss.mean(n).toFixed(6),stddev=+ss.standardDeviation(n).toFixed(6),median=+ss.median(n).toFixed(6);
const tab=tt([['Stat','Value'],['mean',String(mean)],['stddev',String(stddev)],['median',String(median)]]);
const html=DP.sanitize(`<pre class="stats">${tab}</pre>`);
return{valid:true,label:c.label,stats:{mean,stddev,median},table:html,count:c.count};
}
export default hexchain;
// Generation time: 6.554s
// Result: PASS