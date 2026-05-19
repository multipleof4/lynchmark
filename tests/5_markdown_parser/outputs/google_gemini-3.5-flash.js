export const parseMarkdown = async (markdown) => {
  try {
    const { marked } = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js');
    return marked.parse(markdown || '');
  } catch (error) {
    console.error('Failed to parse Markdown:', error);
    return '';
  }
};
export default parseMarkdown;
// Generation time: 8.849s
// Result: PASS