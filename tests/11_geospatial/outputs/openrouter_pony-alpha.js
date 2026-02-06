const analyzeGPS = async (readings, boundary) => {
  const t = await import('https://esm.sh/@turf/turf');
  const pts = readings
    .filter(r => t.booleanPointInPolygon(t.point(r.loc), boundary))
    .sort((a, b) => a.ts - b.ts)
    .map(r => r.loc);
  return pts.length < 2 ? 0 : Math.round(t.length(t.lineString(pts)) * 100) / 100;
};
export default analyzeGPS;
// Generation time: 93.284s
// Result: PASS