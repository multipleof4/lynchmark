const analyzeGPS = async (readings, boundary) => {
  const turf = await import('https://cdn.skypack.dev/@turf/turf');
  const valid = readings
    .filter(r => turf.booleanWithin(turf.point(r.loc), boundary))
    .sort((a, b) => a.ts - b.ts);
  if (valid.length < 2) return 0;
  const line = turf.lineString(valid.map(r => r.loc));
  return Math.round(turf.length(line, { units: 'kilometers' }) * 100) / 100;
};
export default analyzeGPS;
// Generation time: 3.035s
// Result: PASS