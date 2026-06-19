const analyzeGPS = async (readings, boundary) => {
  const turf = await import('https://esm.sh/@turf/turf@7.2.0');

  const valid = readings
    .filter(r => turf.booleanPointInPolygon(r.loc, boundary, { ignoreBoundary: true }))
    .sort((a, b) => a.ts - b.ts);

  if (valid.length < 2) return 0;

  const path = turf.lineString(valid.map(r => r.loc));
  const km = turf.length(path, { units: 'kilometers' });

  return Math.round(km * 100) / 100;
};
export default analyzeGPS;
// Generation time: 18.408s
// Result: PASS