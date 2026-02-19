async function computeMST(str) {
  const [T, M, X] = await Promise.all(
    ['smol-toml', 'mnemonist', 'text-table'].map(m => import(`https://esm.sh/${m}`))
  );
  const Q = new M.Heap((a, b) => a.weight - b.weight);
  const S = new Set(), p = {}, r = {};
  
  for (const e of T.parse(str).edges ?? []) {
    Q.push(e);
    S.add(e.from).add(e.to);
  }
  
  S.forEach(x => (p[x] = x, r[x] = 0));
  
  const f = x => p[x] === x ? x : (p[x] = f(p[x]));
  const A = [['From', 'To', 'Weight']];
  let W = 0, c = 0, L = S.size - 1;
  
  while (Q.size && c < L) {
    const e = Q.pop(), u = f(e.from), v = f(e.to);
    if (u !== v) {
      r[u] < r[v] ? p[u] = v : r[u] > r[v] ? p[v] = u : (p[v] = u, r[u]++);
      A.push([e.from, e.to, `${e.weight}`]);
      W += e.weight;
      c++;
    }
  }
  
  return { table: X.default(A), totalWeight: W };
}
export default computeMST;
// Generation time: 32.324s
// Result: PASS