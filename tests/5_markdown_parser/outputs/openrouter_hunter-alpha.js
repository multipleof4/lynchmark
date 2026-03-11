const parseMarkdown = async (md) => {
  const { marked } = await import('https://esm.sh/marked@15.0.7');
  const { default: DOMPurify } = await import('https://esm.sh/dompurify@3.2.3');
  
  const renderer = new marked.Renderer();
  const rules = {
    heading: (text, level) => `<h${level}>${text}</h${level}>`,
    paragraph: (text) => `<p>${text}</p>`,
    strong: (text) => `<strong>${text}</strong>`,
    em: (text) => `<em>${text}</em>`,
    link: (href, title, text) => `<a href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>`,
    code: (code) => `<pre><code>${code}</code></pre>`,
    codespan: (code) => `<code>${code}</code>`,
    list: (body, ordered) => ordered ? `<ol>${body}</ol>` : `<ul>${body}</ul>`,
    listitem: (text) => `<li>${text}</li>`,
    blockquote: (quote) => `<blockquote>${quote}</blockquote>`
  };
  
  Object.keys(rules).forEach(rule => {
    renderer[rule] = (...args) => rules[rule](...args);
  });
  
  marked.use({ renderer, breaks: true, gfm: true });
  const rawHtml = marked.parse(md);
  return DOMPurify.sanitize(rawHtml);
};
export default parseMarkdown;
// Generation time: 11.318s
// Result: FAIL