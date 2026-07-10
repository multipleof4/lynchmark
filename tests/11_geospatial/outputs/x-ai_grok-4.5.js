async function analyzeGPS(readings,boundary){
const{booleanPointInPolygon:i,lineString:l,length:e}=await import('https://esm.sh/@turf/turf@7.1.0');
const v=readings.filter(r=>i(r.loc,boundary,{ignoreBoundary:true})).sort((a,b)=>a.ts-b.ts);
if(v.length<2)return 0;
return+e(l(v.map(r=>r.loc)),{units:'kilometers'}).toFixed(2)
}
export default analyzeGPS;
// Generation time: 14.349s
// Result: PASS