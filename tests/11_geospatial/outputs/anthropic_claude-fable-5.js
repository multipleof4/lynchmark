const analyzeGPS = async (readings, boundary) => {
  const turf = await import('https://cdn.jsdelivr.net/npm/@turf/turf@7/+esm');
  const pts = readings
    .filter(r => turf.booleanPointInPolygon(turf.point(r.loc), boundary, {ignoreBoundary: true}))
    .sort((a, b) => a.ts - b.ts)
    .map(r => r.loc);
  if (pts.length < 2) return 0;
  return Math.round(turf.length(turf.lineString(pts), {units: 'kilometers'}) * 100) / 100;
};
export default analyzeGPS;
// Generation time: 5.576s
// Result: PASS