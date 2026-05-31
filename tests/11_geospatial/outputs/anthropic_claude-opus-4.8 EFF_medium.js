async function analyzeGPS(readings, boundary) {
  const turf = await import("https://cdn.skypack.dev/@turf/turf");
  const inside = readings
    .filter((r) => turf.booleanPointInPolygon(turf.point(r.loc), boundary))
    .sort((a, b) => a.ts - b.ts);
  if (inside.length < 2) return 0;
  const line = turf.lineString(inside.map((r) => r.loc));
  return Math.round(turf.length(line, { units: "kilometers" }) * 100) / 100;
}
export default analyzeGPS;
// Generation time: 2.996s
// Result: FAIL