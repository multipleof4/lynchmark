let _p
async function validateJSON(d, s) {
  if (!_p) _p = (async () => {
    const {default: A} = await import('https://cdn.jsdelivr.net/npm/ajv@8.17.1/dist/ajv2020.esm.js')
    return new A({allErrors: 1})
  })()
  try {
    const a = await _p
    const v = a.validate(s, d)
    return v
      ? {valid: 1, errors: []}
      : {valid: 0, errors: a.errors.map(e => `${e.instancePath||'/'} ${e.message}`.trim())}
  } catch (e) {
    return {valid: 0, errors: [e.message]}
  }
}
export default validateJSON;
// Generation time: 54.656s
// Result: FAIL