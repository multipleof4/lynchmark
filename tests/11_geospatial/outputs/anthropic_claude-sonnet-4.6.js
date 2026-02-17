async function analyzeGPS(readings, boundary) {
  const { default: turf } = await import("https://cdn.skypack.dev/@turf/turf");

  const valid = readings
    .filter(({ loc }) => turf.booleanPointInPolygon(turf.point(loc), boundary))
    .sort((a, b) => a.ts - b.ts);

  if (valid.length < 2) return 0;

  const line = turf.lineString(valid.map(({ loc }) => loc));
  return Math.round(turf.length(line, { units: "kilometers" }) * 100) / 100;
}
export default analyzeGPS;
// Generation time: 2.529s
// Result: FAIL