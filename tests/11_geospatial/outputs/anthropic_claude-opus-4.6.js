async function analyzeGPS(readings, boundary) {
  const turf = await import("https://cdn.jsdelivr.net/npm/@turf/turf@7/+esm");

  const valid = readings
    .filter(r => turf.booleanPointInPolygon(turf.point(r.loc), boundary, { ignoreBoundary: true }))
    .sort((a, b) => a.ts - b.ts);

  if (valid.length < 2) return 0;

  const line = turf.lineString(valid.map(r => r.loc));
  const len = turf.length(line, { units: "kilometers" });

  return Math.round(len * 100) / 100;
}
export default analyzeGPS;
// Generation time: 3.691s
// Result: PASS