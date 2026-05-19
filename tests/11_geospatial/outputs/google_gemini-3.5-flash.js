export async function analyzeGPS(readings, boundary) {
  const { booleanPointInPolygon: inPoly, point, lineString, length } = 
    await import('https://cdn.jsdelivr.net/npm/@turf/turf/+esm');

  const pts = readings
    .filter(r => inPoly(point(r.loc), boundary))
    .sort((a, b) => a.ts - b.ts);

  return pts.length < 2 
    ? 0 
    : +length(lineString(pts.map(r => r.loc))).toFixed(2);
}
export default analyzeGPS;
// Generation time: 8.770s
// Result: PASS