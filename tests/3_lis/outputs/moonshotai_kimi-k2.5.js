const findLISLength = async a => {
  if (!a?.length) return 0
  const { bisectLeft: b } = await import('https://cdn.jsdelivr.net/npm/d3-array@3/+esm')
  const t = []
  for (const x of a) {
    const i = b(t, x)
    i === t.length ? t.push(x) : t[i] = x
  }
  return t.length
}
export default findLISLength;
// Generation time: 34.651s
// Result: PASS