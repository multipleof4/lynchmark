let dependencies;

const loadDependencies = () =>
  dependencies ??= Promise.all([
    import("https://esm.sh/marked@15.0.12"),
    import("https://esm.sh/dompurify@3.2.6")
  ]);

async function parseMarkdown(markdown) {
  if (typeof markdown !== "string") {
    throw new TypeError("Markdown must be a string");
  }

  const [{ marked }, { default: DOMPurify }] = await loadDependencies();
  const html = marked.parse(markdown, { gfm: true });

  return DOMPurify.sanitize(html);
}
export default parseMarkdown;
// Generation time: 13.055s
// Result: PASS