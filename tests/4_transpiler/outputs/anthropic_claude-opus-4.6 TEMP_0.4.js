async function renderTemplate(template, data) {
  const { default: Handlebars } = await import("https://cdn.jsdelivr.net/npm/handlebars@4.7.8/+esm");
  return Handlebars.compile(template)(data);
}
export default renderTemplate;
// Generation time: 1.747s
// Result: PASS