async function analyzeGPS(readings, boundary) {
  const turf = await import('https://cdn.skypack.dev/@turf/turf')
  const inside = readings
    .filter(({ ts, loc }) =>
      Number.isFinite(ts) &&
      Array.isArray(loc) &&
      loc.length === 2 &&
      loc.every(Number.isFinite) &&
      turf.booleanPointInPolygon(turf.point(loc), boundary, { ignoreBoundary: true })
    )
    .sort((a, b) => a.ts - b.ts)

  if (inside.length < 2) return 0

  const line = turf.lineString(inside.map(({ loc }) => loc))
  return +turf.length(line, { units: 'kilometers' }).toFixed(2)
}
export default analyzeGPS;
// Generation time: 2.011s
// Result: PASS