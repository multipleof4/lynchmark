async function analyzeGPS(readings, boundary) {
  const turf = await import('https://esm.sh/@turf/turf');
  const valid = readings.filter(r =>
    turf.booleanPointInPolygon(turf.point(r.loc), boundary, {ignoreBoundary: true})
  ).sort((a, b) => a.ts - b.ts);
  return valid.length < 2 ? 0 : Math.round(turf.length(turf.lineString(valid.map(v => v.loc))) * 100) / 100;
}
export default analyzeGPS;
// Generation time: 97.874s
// Result: PASS