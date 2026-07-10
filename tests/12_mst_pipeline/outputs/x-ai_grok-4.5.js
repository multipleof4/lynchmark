async function computeMST(t){
const[{parse},H,{default:tt}]=await Promise.all([
import('https://esm.sh/smol-toml@1.3.1'),
import('https://esm.sh/mnemonist@0.39.8/heap'),
import('https://esm.sh/text-table@0.2.0')
]);
const Heap=H.default;
const d=parse(t);
const es=d.edges||[];
const ns=new Set;
for(const e of es){ns.add(e.from);ns.add(e.to)}
const n=ns.size;
const h=new Heap((a,b)=>a.weight-b.weight);
for(const e of es)h.push(e);
const p={},r={};
for(const x of ns){p[x]=x;r[x]=0}
const f=x=>{if(p[x]!==x)p[x]=f(p[x]);return p[x]};
const u=(x,y)=>{
const px=f(x),py=f(y);
if(px===py)return!1;
if(r[px]<r[py])p[px]=py;
else if(r[px]>r[py])p[py]=px;
else{p[py]=px;r[px]++}
return!0
};
const m=[];
let w=0;
while(m.length<n-1&&h.size){
const e=h.pop();
if(u(e.from,e.to)){m.push([e.from,e.to,String(e.weight)]);w+=e.weight}
}
return{table:tt([['From','To','Weight'],...m]),totalWeight:w}
}
export default computeMST;
// Generation time: 15.793s
// Result: PASS