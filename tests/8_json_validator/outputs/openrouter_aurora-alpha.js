async function validateJSON(d, s) {
  const {default: Ajv} = await import('https://cdn.jsdelivr.net/npm/ajv@8/dist/ajv.esm.js');
  const {default: addFormats} = await import('https://cdn.jsdelivr.net/npm/ajv-formats@2/dist/ajv-formats.esm.js');
  const v = new Ajv({allErrors: true, strict: false});
  addFormats(v);
  const ok = v.compile(s)(d);
  return {valid: ok, errors: ok ? [] : v.errors.map(e => e.message)};
}
export default validateJSON;
// Generation time: 1.295s
// Result: FAIL