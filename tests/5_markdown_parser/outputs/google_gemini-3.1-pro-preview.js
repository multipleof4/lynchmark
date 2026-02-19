const parseMarkdown = async m => {
  const { parse } = await import('https://cdn.jsdelivr.net/npm/marked/+esm');
  return parse(m);
};
export default parseMarkdown;
// Generation time: 23.960s
// Result: PASS