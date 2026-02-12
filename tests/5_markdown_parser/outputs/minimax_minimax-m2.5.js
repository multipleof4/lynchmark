async function parseMarkdown(md) {
  const { default: M } = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js');
  return M.parse(md);
}
export default parseMarkdown;
// Generation time: 41.642s
// Result: FAIL