const parseMarkdown = async (md = "") => {
  const { marked } = await import("https://cdn.jsdelivr.net/npm/marked/+esm");
  return marked.parse(md, { gfm: true, breaks: true });
};


export default parseMarkdown;
// Generation time: 6.625s
// Result: PASS