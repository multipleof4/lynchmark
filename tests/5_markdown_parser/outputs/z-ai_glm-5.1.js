async function parseMarkdown(m) {
  const { marked } = await import('https://esm.sh/marked')
  return marked.parse(m)
}
export default parseMarkdown;
// Generation time: 29.156s
// Result: PASS