const findLISLength = async nums => {
  const { bisectLeft } = await import('https://esm.sh/d3-array')
  const tails = []

  for (const n of nums) {
    const i = bisectLeft(tails, n)
    if (i === tails.length) tails.push(n)
    else tails[i] = n
  }

  return tails.length
}
export default findLISLength;
// Generation time: 197.616s
// Result: PASS