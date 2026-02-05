async function findLISLength(nums) {
  const { bisectLeft } = await import("https://cdn.jsdelivr.net/npm/d3-array/+esm");
  const tails = [];
  for (const n of nums) {
    const i = bisectLeft(tails, n);
    i === tails.length ? tails.push(n) : tails[i] = n;
  }
  return tails.length;
}
export default findLISLength;
// Generation time: 3.057s
// Result: PASS