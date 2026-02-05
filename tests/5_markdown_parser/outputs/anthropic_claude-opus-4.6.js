async function parseMarkdown(md) {
  const { marked } = await import("https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js");
  return marked.parse(md);
}
export default parseMarkdown;
// Generation time: 2.453s
// Result: PASS