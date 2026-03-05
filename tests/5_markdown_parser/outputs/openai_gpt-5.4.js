const parseMarkdown = async markdown => {
  if (typeof markdown !== 'string') throw new TypeError('Expected a Markdown string')

  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js')

  marked.setOptions({
    gfm: true,
    breaks: false
  })

  return marked.parse(markdown)
}
export default parseMarkdown;
// Generation time: 1.414s
// Result: PASS