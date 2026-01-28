const parseMarkdown = (() => {
  let m;
  return async s => {
    m = m || await import('https://esm.sh/marked');
    return m.marked.parse(s);
  };
})();
export default parseMarkdown;
// Generation time: 49.501s
// Result: PASS