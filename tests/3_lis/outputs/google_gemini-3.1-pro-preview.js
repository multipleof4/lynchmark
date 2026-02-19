export const findLISLength = async a => {
  const { bisectLeft } = await import("https://esm.sh/d3-array");
  const s = [];
  for (const x of a) s[bisectLeft(s, x)] = x;
  return s.length;
};
export default findLISLength;
// Generation time: 15.537s
// Result: PASS