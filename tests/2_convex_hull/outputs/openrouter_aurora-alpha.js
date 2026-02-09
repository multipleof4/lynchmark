async function findConvexHull(p){
 const _=await import('https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm');
 const s=_.sortBy(_.uniqBy(p,q=>q.x+','+q.y),['x','y']);
 const c=(o,a,b)=> (a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
 const L=[];
 for(const q of s){
  while(L.length>1 && c(L[L.length-2],L[L.length-1],q)<=0) L.pop();
  L.push(q);
 }
 const U=[];
 for(let i=s.length-1;i>=0;i--){
  const q=s[i];
  while(U.length>1 && c(U[U.length-2],U[U.length-1],q)<=0) U.pop();
  U.push(q);
 }
 U.pop();L.pop();
 return L.concat(U);
}
export default findConvexHull;
// Generation time: 1.623s
// Result: PASS