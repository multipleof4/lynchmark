async function findLISLength(nums) {
  const { bisectLeft } = await import("https://cdn.jsdelivr.net/npm/d3-array/+esm");
  const tails = [];
  for (const n of nums) {
    const i = bisectLeft(tails, n);
    if (i === tails.length) tails.push(n);
    else tails[i] = n;
  }
  return tails.length;
}
export default findLISLength;
// Generation time: 2.405s
// Result: PASS