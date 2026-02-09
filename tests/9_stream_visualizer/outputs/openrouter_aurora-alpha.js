async function createStreamVisualizer(src,{maxPoints=500,alpha=.5,width=800,height=600,yDomain}){
  const d3=await import('https://cdn.jsdelivr.net/npm/d3@7')
  const d=[];let e
  for await(const{timestamp:t,value:v}of src){
    e=e===undefined?v:alpha*v+(1-alpha)*e
    d.push({timestamp:t,value:v,ema:e})
    if(d.length>maxPoints)d.shift()
  }
  if(!d.length)return{data:[],path:''}
  const x=d3.scaleLinear().domain([d[0].timestamp,d.at(-1).timestamp]).range([0,width])
  const y=d3.scaleLinear().domain(yDomain||[d3.min(d,d=>d.ema),d3.max(d,d=>d.ema)]).range([height,0])
  const p=d3.line().x(v=>x(v.timestamp)).y(v=>y(v.ema)).curve(d3.curveLinear)
  return{data:d,path:p(d)}
}
export default createStreamVisualizer;
// Generation time: 1.456s
// Result: FAIL