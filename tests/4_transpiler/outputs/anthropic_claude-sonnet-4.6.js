const renderTemplate = async (template, data) => {
  const { default: Handlebars } = await import(
    "https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.esm.min.js"
  );
  return Handlebars.compile(template)(data);
};
export default renderTemplate;
// Generation time: 1.675s
// Result: FAIL