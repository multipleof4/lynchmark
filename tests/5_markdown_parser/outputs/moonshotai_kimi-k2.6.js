const parseMarkdown=async(md)=>{
const{default:MarkdownIt}=await import('https://esm.sh/markdown-it@14.1.0');
return new MarkdownIt({html:false}).render(md);
};
export default parseMarkdown;
// Generation time: 95.822s
// Result: PASS