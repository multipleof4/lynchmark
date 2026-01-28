const findConvexHull=async p=>{
  const{sortBy:s,uniqWith:u}=await import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm');
  const a=u(s(p,['x','y']),(p,q)=>p.x===q.x&&p.y===q.y),n=a.length;
  if(n<2)return a;
  const c=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x),h=[];
  for(let i=0;i<n;h.push(a[i++]))while(h.length>1&&c(h[h.length-2],h[h.length-1],a[i])<=0)h.pop();
  const g=[];
  for(let i=n-1;i>=0;g.push(a[i--]))while(g.length>1&&c(g[g.length-2],g[g.length-1],a[i])<=0)g.pop();
  h.pop();g.pop();
  return h.concat(g);
};
export default findConvexHull;
// Generation time: 77.946s
// Result: PASS