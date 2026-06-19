async function analyzeGPS(readings, boundary) {
  const turf = await import('https://esm.sh/@turf/turf');
  const valid = readings
    .filter(r => turf.booleanPointInPolygon(turf.point(r.loc), boundary, { ignoreBoundary: true }))
    .sort((a, b) => a.ts - b.ts);
  
  if (valid.length < 2) return 0;
  
  const len = turf.length(
    turf.lineString(valid.map(r => r.loc)),
    { units: 'kilometers' }
  );
  
  return Math.round(len * 100) / 100;
}
export default analyzeGPS;
// Generation time: 28.608s
// Result: PASS