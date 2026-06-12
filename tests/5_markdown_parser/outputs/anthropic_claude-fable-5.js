let markedPromise;

const loadMarked = () =>
  markedPromise ??= import('https://cdn.jsdelivr.net/npm/marked@12.0.2/+esm');

async function parseMarkdown(markdown) {
  if (typeof markdown !== 'string') throw new TypeError('parseMarkdown expects a string');
  const { marked } = await loadMarked();
  return marked.parse(markdown, { gfm: true, async: true });
}
export default parseMarkdown;
// Generation time: 10.393s
// Result: PASS