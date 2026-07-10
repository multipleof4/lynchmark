async function findConvexHull(points){
const{sortBy,uniqWith}=await import("https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm");
points=uniqWith(points,(a,b)=>a.x===b.x&&a.y===b.y);
points=sortBy(points,["x","y"]);
if(points.length<=2)return points;
const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
let lower=[];
for(const p of points){
while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();
lower.push(p);
}
let upper=[];
for(let i=points.length-1;i>=0;i--){
const p=points[i];
while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();
upper.push(p);
}
return lower.slice(0,-1).concat(upper.slice(0,-1));
}
export default findConvexHull;
// Generation time: 37.988s
// Result: PASS