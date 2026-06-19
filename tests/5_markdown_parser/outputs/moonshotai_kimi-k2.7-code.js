const parseMarkdown = async (md) => {
  const { default: MarkdownIt } = await import('https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm');
  return MarkdownIt({ html: false, linkify: true }).render(md);
};
export default parseMarkdown;
// Generation time: 18.711s
// Result: PASS