const computeMST=async s=>{
const[{parse:P},{Heap:H},T]=await Promise.all([import('https://esm.sh/smol-toml'),import('https://esm.sh/mnemonist'),import('https://esm.sh/text-table')]);
const d=P(s),e=d.edges||[],q=new H((x,y)=>x.w-y.w),u=new Set;
for(const c of e){q.push({f:c.from,t:c.to,w:c.weight});u.add(c.from);u.add(c.to)}
const n=u.size,a={},b={},f=x=>a[x]===x?x:(a[x]=f(a[x])),m=(x,y)=>{let r=f(x),s=f(y);if(r===s)return 0;if(b[r]<b[s])[r,s]=[s,r];a[s]=r;b[r]===b[s]&&b[r]++;return 1};
for(const k of u){a[k]=k;b[k]=0}
const v=[];let t=0;
while(v.length<n-1&&q.size){const c=q.pop();if(m(c.f,c.t)){v.push([c.f,c.t,String(c.w)]);t+=c.w}}
return{table:(T.default||T)([['From','To','Weight'],...v]),totalWeight:t}
}
export default computeMST;
// Generation time: 66.902s
// Result: PASS