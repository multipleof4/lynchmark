const parseMarkdown = async (markdown) => {
  const { marked } = await import("https://cdn.jsdelivr.net/npm/marked/src/marked.esm.js");
  return marked.parse(markdown);
};
export default parseMarkdown;
// Generation time: 1.296s
// Result: FAIL