const analyzeGPS = async (r, b) => {
  const t = await import('https://cdn.jsdelivr.net/npm/@turf/turf/+esm');
  
  const v = r
    .filter(p => t.booleanPointInPolygon(t.point(p.loc), b, { ignoreBoundary: true }))
    .sort((x, y) => x.ts - y.ts);
    
  return v.length < 2 ? 0 : +t.length(t.lineString(v.map(p => p.loc))).toFixed(2);
};
export default analyzeGPS;
// Generation time: 23.653s
// Result: PASS