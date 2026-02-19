const renderTemplate = async (template, data) => {
  const { default: hbs } = await import("https://esm.sh/handlebars");
  return hbs.compile(template)(data);
};
export default renderTemplate;
// Generation time: 14.818s
// Result: PASS