async function analyzeGPS(readings, boundary) {
  const{booleanPointInPolygon,point,lineString,length}=await import('https://cdn.jsdelivr.net/npm/@turf/turf@6/+esm');
  const v=readings.filter(r=>booleanPointInPolygon(point(r.loc),boundary)).sort((a,b)=>a.ts-b.ts);
  return v.length<2?0:Math.round(length(lineString(v.map(r=>r.loc)),{units:'kilometers'})*100)/100;
}
export default analyzeGPS;
// Generation time: 45.041s
// Result: PASS