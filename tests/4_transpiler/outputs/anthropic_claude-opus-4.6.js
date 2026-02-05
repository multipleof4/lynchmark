async function renderTemplate(template, data) {
  const { default: Handlebars } = await import("https://esm.sh/handlebars");
  return Handlebars.compile(template)(data);
}
export default renderTemplate;
// Generation time: 2.186s
// Result: PASS