async function findLISLength(nums) {
  if (!nums?.length) return 0;

  const { bisectLeft } = await import("https://cdn.skypack.dev/d3-array");

  const tails = [];

  for (const n of nums) {
    const i = bisectLeft(tails, n);
    tails[i] = n;
  }

  return tails.length;
}
export default findLISLength;
// Generation time: 1.943s
// Result: PASS