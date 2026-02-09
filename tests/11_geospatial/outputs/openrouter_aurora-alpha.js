async function analyzeGPS(readings, boundary) {
  const turf = await import('https://cdn.skypack.dev/@turf/turf');
  const inside = readings.filter(r =>
    turf.booleanPointInPolygon(turf.point(r.loc), boundary, { ignoreBoundary: true })
  );
  if (inside.length < 2) return 0;
  inside.sort((a, b) => a.ts - b.ts);
  const line = turf.lineString(inside.map(r => r.loc));
  const km = turf.length(line, { units: 'kilometers' });
  return Math.round(km * 100) / 100;
}
export default analyzeGPS;
// Generation time: 1.710s
// Result: PASS