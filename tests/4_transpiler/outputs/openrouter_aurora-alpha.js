let hb
async function renderTemplate(t, d) {
  hb = hb || (await import('https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.esm.js')).default
  return hb.compile(t)(d)
}
export default renderTemplate;
// Generation time: 1.117s
// Result: FAIL