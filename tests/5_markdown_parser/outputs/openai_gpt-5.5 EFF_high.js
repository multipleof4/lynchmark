const parseMarkdown = (() => {
  let libs;

  return async markdown => {
    libs ||= Promise.all([
      import("https://cdn.jsdelivr.net/npm/marked@13/+esm"),
      import("https://cdn.jsdelivr.net/npm/dompurify@3/+esm")
    ]);

    const [{ marked }, { default: DOMPurify }] = await libs;

    marked.use({
      gfm: true,
      breaks: false,
      async: false
    });

    return DOMPurify.sanitize(
      marked.parse(String(markdown ?? ""))
    );
  };
})();
export default parseMarkdown;
// Generation time: 13.490s
// Result: PASS