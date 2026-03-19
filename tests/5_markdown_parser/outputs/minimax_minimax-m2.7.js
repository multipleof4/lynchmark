export async function parseMarkdown(m) {
  try {
    const [{ marked }, { default: DP }] = await Promise.all([
      import("https://esm.sh/marked"),
      import("https://esm.sh/dompurify")
    ]);
    marked.setOptions({ gfm: true });
    return DP.sanitize(marked.parse(m));
  } catch (_) {
    return "";
  }
}
export default parseMarkdown;
// Generation time: 64.285s
// Result: PASS