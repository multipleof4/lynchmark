async function parseMarkdown(md) {
  const { marked } = await import("https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js");
  
  marked.setOptions({
    gfm: true,
    breaks: true
  });

  return marked.parse(md);
}
export default parseMarkdown;
// Generation time: 0.838s
// Result: PASS