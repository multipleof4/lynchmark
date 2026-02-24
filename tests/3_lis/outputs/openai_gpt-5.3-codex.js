async function findLISLength(arr) {
  if (!Array.isArray(arr)) throw new TypeError("Expected an array of numbers");
  const { bisectLeft } = await import("https://cdn.jsdelivr.net/npm/d3-array@3/+esm");
  const tails = [];
  for (const n of arr) {
    if (typeof n !== "number" || Number.isNaN(n)) throw new TypeError("Array must contain only valid numbers");
    tails[bisectLeft(tails, n)] = n;
  }
  return tails.length;
}
export default findLISLength;
// Generation time: 7.363s
// Result: PASS