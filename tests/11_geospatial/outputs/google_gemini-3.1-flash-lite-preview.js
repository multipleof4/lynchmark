async function analyzeGPS(readings, boundary) {
  const { booleanPointInPolygon, lineString, length } = await import('https://cdn.skypack.dev/@turf/turf');

  const valid = readings
    .filter(r => booleanPointInPolygon(r.loc, boundary))
    .sort((a, b) => a.ts - b.ts);

  if (valid.length < 2) return 0;

  const dist = length(lineString(valid.map(r => r.loc)), { units: 'kilometers' });

  return +dist.toFixed(2);
}
export default analyzeGPS;
// Generation time: 1.377s
// Result: PASS