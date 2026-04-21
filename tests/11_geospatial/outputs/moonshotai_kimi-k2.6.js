const analyzeGPS = async (readings, boundary) => {
  const { booleanPointInPolygon, lineString, length } = await import('https://esm.sh/@turf/turf');
  const v = readings.filter(r => booleanPointInPolygon(r.loc, boundary, { ignoreBoundary: true })).sort((a, b) => a.ts - b.ts);
  return v.length < 2 ? 0 : +length(lineString(v.map(r => r.loc)), { units: 'kilometers' }).toFixed(2);
};
export default analyzeGPS;
// Generation time: 74.841s
// Result: PASS