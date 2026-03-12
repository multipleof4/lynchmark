export async function analyzeGPS(r,b){let t=await import("https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js");let f=r.filter(p=>t.booleanPointInPolygon(p.loc,b)).sort((a,c)=>a.ts-c.ts).map(p=>p.loc);return f.length<2?0:Math.round(100*t.length(t.lineString(f),"kilometers"))/100}
export default analyzeGPS;
// Generation time: 0.886s
// Result: FAIL