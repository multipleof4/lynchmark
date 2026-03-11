```javascript
const analyzeGPS = async (readings, boundary) => {
    const turf = await import('https://unpkg.com/@turf/turf@6/turf.min.js');
    const boundaryPolygon = turf.polygon(boundary.coordinates);
    const validReadings = readings.filter(r => 
        turf.booleanPointInPolygon(turf.point(r.loc), boundaryPolygon)
    );
    const sorted = validReadings.sort((a, b) => a.ts - b.ts);
    if (sorted.length < 2) return 0;
    const line = turf.lineString(sorted.map(r => r.loc));
    return Math.round(turf.length(line, {units: 'kilometers'}) * 100) / 100;
};
export default analyzeGPS;
// Generation time: 56.302s
// Result: FAIL