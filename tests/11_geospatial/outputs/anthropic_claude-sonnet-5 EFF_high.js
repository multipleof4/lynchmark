async function analyzeGPS(readings, boundary) {
  const turf = await import('https://esm.sh/@turf/turf@6');

  const valid = readings
    .filter(r => turf.booleanPointInPolygon(turf.point(r.loc), boundary))
    .sort((a, b) => a.ts - b.ts);

  if (valid.length < 2) return 0;

  const line = turf.lineString(valid.map(r => r.loc));
  const km = turf.length(line, { units: 'kilometers' });

  return Math.round(km * 100) / 100;
}
export default analyzeGPS;
// Generation time: 4.282s
// Result: PASS