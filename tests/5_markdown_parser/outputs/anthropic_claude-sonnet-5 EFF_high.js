async function parseMarkdown(markdown) {
  const [{ marked }, DOMPurify] = await Promise.all([
    import('https://esm.sh/marked@12'),
    import('https://esm.sh/dompurify@3').then(m => m.default),
  ]);

  marked.setOptions({ gfm: true, breaks: true });

  const rawHtml = marked.parse(markdown ?? '');
  return DOMPurify.sanitize(rawHtml);
}
export default parseMarkdown;
// Generation time: 4.740s
// Result: PASS