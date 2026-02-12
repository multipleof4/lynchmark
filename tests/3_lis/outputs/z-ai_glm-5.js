async function findLISLength(nums) {
  const { bisectLeft } = await import('https://esm.sh/d3-array@3');
  const tails = [];
  for (const n of nums) {
    const i = bisectLeft(tails, n);
    i < tails.length ? tails[i] = n : tails.push(n);
  }
  return tails.length;
}
export default findLISLength;
// Generation time: 96.878s
// Result: PASS