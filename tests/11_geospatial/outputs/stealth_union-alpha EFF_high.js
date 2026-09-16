async function analyzeGPS(readings, boundary) {
  const { booleanPointInPolygon, lineString, length } =
    await import("https://cdn.jsdelivr.net/npm/@turf/turf@7.2.0/+esm");

  const points = readings
    .filter(({ loc }) => booleanPointInPolygon(loc, boundary, { ignoreBoundary: true }))
    .sort((a, b) => a.ts - b.ts)
    .map(({ loc }) => loc);

  return points.length < 2
    ? 0
    : +length(lineString(points), { units: "kilometers" }).toFixed(2);
}
export default analyzeGPS;
// Generation time: 53.787s
// Result: PASS