let loader;

export async function parseMarkdown(markdown) {
  loader ||= import('https://esm.sh/marked@12').then((m) => m.marked);
  const marked = await loader;
  const source = typeof markdown === 'string' ? markdown : '';
  return marked.parse(source, { gfm: true, breaks: false });
}
export default parseMarkdown;
// Generation time: 59.989s
// Result: PASS