async function findLISLength(nums) {
  const { bisectLeft } = await import('https://cdn.skypack.dev/d3-array');
  const tails = [];

  for (const x of nums) {
    const i = bisectLeft(tails, x);
    i === tails.length ? tails.push(x) : (tails[i] = x);
  }

  return tails.length;
}
export default findLISLength;
// Generation time: 0.903s
// Result: PASS