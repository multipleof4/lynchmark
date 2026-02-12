const renderTemplate = async (t, d) => {
  const { default: H } = await import('https://esm.sh/handlebars');
  return H.compile(t)(d);
};
export default renderTemplate;
// Generation time: 42.272s
// Result: PASS