async function createStreamVisualizer(asyncIterable,{maxPoints,alpha,width,height,yDomain}){
const d3=await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
const data=[];
let p;
for await(const{timestamp:t,value:v}of asyncIterable){
const e=p==null?v:alpha*v+(1-alpha)*p;
p=e;
data.push({timestamp:t,value:v,ema:e});
if(data.length>maxPoints)data.shift();
}
if(!data.length)return{data,path:''};
const x=d3.scaleLinear().domain([data[0].timestamp,data[data.length-1].timestamp]).range([0,width]);
const y=d3.scaleLinear().domain(yDomain).range([height,0]);
const path=d3.line().x(d=>x(d.timestamp)).y(d=>y(d.ema))(data);
return{data,path};
}
export default createStreamVisualizer;
// Generation time: 7.991s
// Result: PASS