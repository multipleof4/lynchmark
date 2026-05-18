async function analyzeGPS(readings, boundary) {
  const turf = await import("https://esm.sh/@turf/turf@7.2.0");

  const valid = readings
    .filter(({ loc }) =>
      turf.booleanPointInPolygon(turf.point(loc), boundary, { ignoreBoundary: true })
    )
    .sort((a, b) => a.ts - b.ts);

  if (valid.length < 2) return 0;

  const line = turf.lineString(valid.map(({ loc }) => loc));
  const km = turf.length(line, { units: "kilometers" });

  return +km.toFixed(2);
}
export default analyzeGPS;
// Generation time: 13.413s
// Result: PASS