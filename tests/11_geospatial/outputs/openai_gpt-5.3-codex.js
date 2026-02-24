const getTurf = (() => {
  let mod;
  return () => (mod ??= import("https://cdn.jsdelivr.net/npm/@turf/turf@7.2.0/+esm"));
})();

async function analyzeGPS(readings, boundary) {
  if (!Array.isArray(readings) || !boundary) return 0;
  const turf = await getTurf();
  const coords = readings
    .filter(
      r =>
        r &&
        Number.isFinite(r.ts) &&
        Array.isArray(r.loc) &&
        r.loc.length === 2 &&
        r.loc.every(Number.isFinite) &&
        turf.booleanPointInPolygon(turf.point(r.loc), boundary, { ignoreBoundary: true })
    )
    .sort((a, b) => a.ts - b.ts)
    .map(r => r.loc);

  if (coords.length < 2) return 0;
  const km = turf.length(turf.lineString(coords), { units: "kilometers" });
  return Math.round(km * 100) / 100;
}
export default analyzeGPS;
// Generation time: 10.244s
// Result: PASS