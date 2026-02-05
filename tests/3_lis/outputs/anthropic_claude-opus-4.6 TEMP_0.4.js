async function findLISLength(nums) {
  const { bisectLeft } = await import("https://cdn.jsdelivr.net/npm/d3-array/+esm");
  const tails = [];
  for (const n of nums) {
    const i = bisectLeft(tails, n);
    i < tails.length ? tails[i] = n : tails.push(n);
  }
  return tails.length;
}
export default findLISLength;
// Generation time: 3.321s
// Result: PASS