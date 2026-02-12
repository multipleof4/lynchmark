const parseMarkdown = async md =>
  (await import('https://esm.sh/marked')).default(md);
export default parseMarkdown;
// Generation time: 41.263s
// Result: FAIL