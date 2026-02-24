async function parseMarkdown(markdown) {
  const src = typeof markdown === 'string' ? markdown : `${markdown ?? ''}`;
  parseMarkdown._deps ??= Promise.all([
    import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'),
    import('https://cdn.jsdelivr.net/npm/dompurify@3.2.6/+esm')
  ]);
  const [{ marked }, { default: DOMPurify }] = await parseMarkdown._deps;
  if (!parseMarkdown._ready) {
    marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
    parseMarkdown._ready = true;
  }
  return DOMPurify.sanitize(marked.parse(src), { USE_PROFILES: { html: true } });
}
export default parseMarkdown;
// Generation time: 11.720s
// Result: PASS