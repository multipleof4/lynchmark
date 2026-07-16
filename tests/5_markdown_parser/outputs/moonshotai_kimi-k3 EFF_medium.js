let libs;

const load = () => libs ??= Promise.all([
  import('https://cdn.jsdelivr.net/npm/marked@12.0.2/+esm'),
  import('https://cdn.jsdelivr.net/npm/dompurify@3.1.5/+esm'),
]).then(([{ marked }, { default: purify }]) => ({ marked, purify }));

async function parseMarkdown(md) {
  const { marked, purify } = await load();
  const html = marked.parse(String(md ?? ''), { gfm: true });
  return purify.sanitize(html, { USE_PROFILES: { html: true } });
}
export default parseMarkdown;
// Generation time: 40.071s
// Result: PASS