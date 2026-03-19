async function analyzeGPS(readings, boundary) {
  const mod = await import('https://cdn.jsdelivr.net/npm/@turf/turf/turf.mjs');
  const turf = mod.default || mod;
  const pts = readings.filter(r => {
    const p = turf.point(r.loc);
    return turf.booleanPointInPolygon(p, boundary) && !turf.booleanPointOnPolygon(p, boundary);
  });
  if (pts.length < 2) return 0;
  pts.sort((a, b) => a.ts - b.ts);
  return Math.round(turf.length(turf.lineString(pts.map(p => p.loc)), {units: 'kilometers'}) * 100) / 100;
}
export default analyzeGPS;
// Generation time: 211.389s
// Result: FAIL