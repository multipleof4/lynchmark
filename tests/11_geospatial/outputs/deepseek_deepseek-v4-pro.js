async function analyzeGPS(r, e) {
  try {
    const t = await import('https://cdn.jsdelivr.net/npm/@turf/turf@7.0.0/dist/turf.min.mjs');
    const v = r.filter(({ loc: a }) => t.booleanPointInPolygon(t.point(a), e));
    if (v.length < 2) return 0;
    v.sort((a, b) => a.ts - b.ts);
    const c = v.map(a => a.loc);
    const l = t.lineString(c);
    const n = t.length(l, { units: 'kilometers' });
    return Math.round(n * 100) / 100;
  } catch {
    return 0;
  }
}
export default analyzeGPS;
// Generation time: 59.388s
// Result: FAIL