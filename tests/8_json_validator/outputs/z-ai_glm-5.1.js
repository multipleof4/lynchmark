async function validateJSON(json, schema) {
  const { default: Ajv } = await import('https://esm.sh/ajv')
  const ajv = new Ajv()
  const valid = ajv.validate(schema, json)
  return { valid, errors: valid ? [] : ajv.errors.map(e => e.message) }
}
export default validateJSON;
// Generation time: 28.047s
// Result: PASS