let turfModule;

async function analyzeGPS(readings, boundary) {
  turfModule ||= import("https://cdn.jsdelivr.net/npm/@turf/turf@7.2.0/+esm");

  const {
    point,
    lineString,
    length: pathLength,
    booleanPointInPolygon
  } = await turfModule;

  const valid = readings
    .filter(({ loc }) =>
      booleanPointInPolygon(point(loc), boundary, { ignoreBoundary: true })
    )
    .sort((a, b) => a.ts - b.ts);

  if (valid.length < 2) return 0;

  const path = lineString(valid.map(({ loc }) => loc));

  return Number(pathLength(path).toFixed(2));
}
export default analyzeGPS;
// Generation time: 12.391s
// Result: PASS