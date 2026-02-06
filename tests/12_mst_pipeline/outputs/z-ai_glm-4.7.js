async function computeMST(t) {
  const [
    { parse: P },
    { Heap: H },
    { default: T }
  ] = await Promise.all([
    import('https://esm.sh/smol-toml'),
    import('https://esm.sh/mnemonist'),
    import('https://esm.sh/text-table')
  ]);

  const E = P(t).edges;
  const p = new Map(), r = new Map();

  const f = (x) => {
    if (!p.has(x)) { p.set(x, x); r.set(x, 0); return x; }
    if (p.get(x) !== x) p.set(x, f(p.get(x)));
    return p.get(x);
  };

  const u = (x, y) => {
    const a = f(x), b = f(y);
    if (a === b) return 0;
    if (r.get(a) < r.get(b)) p.set(a, b);
    else if (r.get(a) > r.get(b)) p.set(b, a);
    else { p.set(b, a); r.set(a, r.get(a) + 1); }
    return 1;
  };

  const h = new H((a, b) => a[2] - b[2]);
  E.forEach(e => h.push([e.from, e.to, e.weight]));

  const M = [];
  let S = 0;
  const N = new Set(E.flatMap(e => [e.from, e.to]));

  while (h.size && M.length < N.size - 1) {
    const [i, j, w] = h.pop();
    if (u(i, j)) {
      M.push([i, j, String(w)]);
      S += w;
    }
  }

  return {
    table: T([['From', 'To', 'Weight'], ...M]),
    totalWeight: S
  };
}
export default computeMST;
// Generation time: 62.217s
// Result: PASS