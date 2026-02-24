const loadHandlebars = (() => {
  let p;
  return () =>
    p ??= import('https://cdn.jsdelivr.net/npm/handlebars@4.7.8/+esm').then(
      m => m.default ?? m
    );
})();

async function renderTemplate(template, data = {}) {
  if (typeof template !== 'string') throw new TypeError('template must be a string');
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TypeError('data must be an object');
  return (await loadHandlebars()).compile(template)(data);
}
export default renderTemplate;
// Generation time: 7.680s
// Result: PASS