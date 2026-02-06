const renderTemplate = async (t, d) => {
  const { default: h } = await import('https://esm.sh/handlebars');
  return h.compile(t)(d);
};
export default renderTemplate;
// Generation time: 110.510s
// Result: PASS