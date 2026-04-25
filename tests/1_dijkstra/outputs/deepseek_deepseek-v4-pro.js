async function findShortestPath(g,s,e){
  const {default:P}=await import('https://esm.sh/js-priority-queue');
  const d={};
  for(let k in g)d[k]=Infinity;
  d[s]=0;
  const q=new P({comparator:(a,b)=>a.w-b.w});
  q.queue({n:s,w:0});
  while(q.length){
    const {n,w}=q.dequeue();
    if(n===e)return w;
    if(w>d[n])continue;
    for(const t in g[n]){
      const w2=w+g[n][t];
      if(w2<d[t]){
        d[t]=w2;
        q.queue({n:t,w:w2});
      }
    }
  }
  return Infinity
}
export default findShortestPath;
// Generation time: 45.490s
// Result: PASS