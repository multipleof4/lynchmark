const parseMarkdown = async md => {
  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked/+esm');
  return marked.parse(md);
};
export default parseMarkdown;
// Generation time: 1.391s
// Result: PASS