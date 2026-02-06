const parseMarkdown = async md => {
  const { parse } = await import('https://esm.sh/marked')
  return parse(md)
}
export default parseMarkdown;
// Generation time: 137.282s
// Result: PASS