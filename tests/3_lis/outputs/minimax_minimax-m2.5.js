async function findLISLength(arr) {
  const { bisectLeft } = await import('https://cdn.jsdelivr.net/npm/d3-array@3/+esm');
  const tails = [];
  for (const v of arr) {
    const i = bisectLeft(tails, v);
    i === tails.length ? tails.push(v) : (tails[i] = v);
  }
  return tails.length;
}
export default findLISLength;
// Generation time: 22.716s
// Result: PASS