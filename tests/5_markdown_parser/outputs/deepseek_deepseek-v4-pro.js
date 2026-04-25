async function parseMarkdown(m){
  const{marked}=await import('//cdn.jsdelivr.net/npm/marked@4/lib/marked.esm.js')
  return marked(m)
}
export default parseMarkdown;
// Generation time: 44.452s
// Result: FAIL