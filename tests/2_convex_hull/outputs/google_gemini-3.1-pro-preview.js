const findConvexHull = async p => {
  const { uniqWith, isEqual, sortBy } = await import('https://esm.sh/lodash-es');
  const s = sortBy(uniqWith(p, isEqual), ['x', 'y']);
  if (s.length < 3) return s;

  const cw = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x) <= 0;
  
  const fn = a => a.reduce((h, pt) => {
    while (h.length > 1 && cw(h.at(-2), h.at(-1), pt)) h.pop();
    return h.push(pt), h;
  }, []);

  return [...fn(s).slice(0, -1), ...fn([...s].reverse()).slice(0, -1)];
};
export default findConvexHull;
// Generation time: 39.797s
// Result: PASS