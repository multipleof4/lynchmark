async function parseMarkdown(s){
  const MarkdownIt = (await import('https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.esm.js')).default;
  const md = new MarkdownIt({html:false,linkify:true,typographer:true});
  return md.render(s);
}
export default parseMarkdown;
// Generation time: 1.373s
// Result: FAIL