async function analyzeGPS(readings, boundary) {
  if (!Array.isArray(readings) || readings.length < 2) return 0;
  const m = await import('https://cdn.jsdelivr.net/npm/@turf/turf@7/+esm');
  const { booleanPointInPolygon: inside, lineString, length } = m.default ?? m;
  const coords = readings
    .filter(({ loc }) => loc && inside(loc, boundary, { ignoreBoundary: true }))
    .sort((a, b) => a.ts - b.ts)
    .map(({ loc }) => loc);
  return coords.length < 2 ? 0 : +length(lineString(coords), { units: 'kilometers' }).toFixed(2);
}
export default analyzeGPS;
// Generation time: 75.533s
// Result: PASS