const findLISLength = async arr => {
  if (!Array.isArray(arr)) throw new TypeError('Input must be an array');

  const { bisectLeft } = await import(
    'https://cdn.jsdelivr.net/npm/d3-array@3.2.4/+esm'
  );

  const tails = [];
  for (const v of arr) {
    const i = bisectLeft(tails, v);
    if (i === tails.length) tails.push(v);
    else tails[i] = v;
  }
  return tails.length;
};
export default findLISLength;
// Generation time: 0.883s
// Result: PASS