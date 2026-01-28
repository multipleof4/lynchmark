const analyzeGPS = async (r, b) => {
  const {booleanPointInPolygon, lineString, length} = await import('https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js');
  const v = r.filter(x => booleanPointInPolygon({type: 'Point', coordinates: x.loc}, b, {ignoreBoundary: true})).sort((a, b) => a.ts - b.ts);
  return v.length < 2 ? 0 : Math.round(length(lineString(v.map(x => x.loc))) * 100) / 100;
};
export default analyzeGPS;
// Generation time: 30.668s
// Result: FAIL