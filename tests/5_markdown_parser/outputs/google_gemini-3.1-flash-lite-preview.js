async function parseMarkdown(md) {
  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@12.0.0/+esm');
  
  marked.setOptions({
    gfm: true,
    breaks: true
  });

  return marked.parse(md);
}
export default parseMarkdown;
// Generation time: 1.089s
// Result: PASS