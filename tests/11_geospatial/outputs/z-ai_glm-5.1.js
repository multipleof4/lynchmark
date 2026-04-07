async function analyzeGPS(readings, boundary) {
  const t = await import('https://esm.sh/@turf/turf')
  const v = readings
    .filter(r => t.booleanPointInPolygon(t.point(r.loc), boundary))
    .sort((a, b) => a.ts - b.ts)
  return v.length < 2 ? 0 : Math.round(t.length(t.lineString(v.map(r => r.loc))) * 100) / 100
}
export default analyzeGPS;
// Generation time: 54.397s
// Result: PASS