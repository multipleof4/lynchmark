const computeMST=async s=>{
  const[{parse},{Heap},{default:T}]=await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist'),
    import('https://esm.sh/text-table')
  ]);
  const E=parse(s).edges||[];
  const V=[...new Set(E.flatMap(e=>[e.from,e.to]))];
  const I={},P=[],R=[];
  V.forEach((v,i)=>{I[v]=i;P[i]=i;R[i]=0});
  const F=x=>P[x]===x?x:P[x]=F(P[x]);
  const U=(x,y)=>{
    let a=F(x),b=F(y);
    if(a===b)return 0;
    if(R[a]<R[b])[a,b]=[b,a];
    P[b]=a;
    R[a]+=R[a]===R[b];
    return 1;
  };
  const H=new Heap((a,b)=>a.w-b.w);
  E.forEach(e=>H.push({u:e.from,v:e.to,w:e.weight}));
  const M=[];
  let W=0;
  while(H.size&&M.length<V.length-1){
    const c=H.pop();
    if(U(I[c.u],I[c.v])){
      M.push([c.u,c.v,String(c.w)]);
      W+=c.w;
    }
  }
  return{table:T([['From','To','Weight'],...M]),totalWeight:W};
};
export default computeMST;
// Generation time: 183.408s
// Result: PASS