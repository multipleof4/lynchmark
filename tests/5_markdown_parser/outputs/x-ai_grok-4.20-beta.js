export const parseMarkdown = async m => {
    const [{marked}] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/marked@14.1.4/+esm')
    ]);
    const html = marked.parse(m);
    return html;
};
export default parseMarkdown;
// Generation time: 0.670s
// Result: PASS