const parseMarkdown = async (md) => {
  const { marked } = await import('https://esm.sh/marked');
  return marked.parse(md);
};
export default parseMarkdown;
// Generation time: 17.682s
// Result: PASS