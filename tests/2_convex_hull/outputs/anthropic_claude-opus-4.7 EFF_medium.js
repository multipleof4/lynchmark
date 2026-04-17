async function findConvexHull(points) {
    const _ = (await import('https://cdn.skypack.dev/lodash')).default;
    const pts = _.sortBy(_.uniqWith(points, (a, b) => a.x === b.x && a.y === b.y), ['x', 'y']);
    if (pts.length < 2) return pts.slice();
    const cross = (O, A, B) => (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
    const build = arr => {
        const h = [];
        for (const p of arr) {
            while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
            h.push(p);
        }
        return h;
    };
    const lower = build(pts);
    const upper = build([...pts].reverse());
    return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
export default findConvexHull;
// Generation time: 4.186s
// Result: PASS