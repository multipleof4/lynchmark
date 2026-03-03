async function renderTemplate(tmpl, data) {
  const { compile } = await import('https://cdn.skypack.dev/handlebars');
  return compile(tmpl)(data);
}
export default renderTemplate;
// Generation time: 1.302s
// Result: PASS