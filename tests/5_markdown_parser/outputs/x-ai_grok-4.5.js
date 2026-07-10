async function parseMarkdown(s){
const{marked}=await import('https://cdn.jsdelivr.net/npm/marked@13.0.3/lib/marked.esm.js')
return marked.parse(s)
}
export default parseMarkdown;
// Generation time: 6.585s
// Result: PASS