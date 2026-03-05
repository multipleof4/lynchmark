export async function validateJSON(data, schema) {
  try {
    const [{ default: Ajv }, { default: addFormats }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/ajv@8/dist/ajv.min.js'),
      import('https://cdn.jsdelivr.net/npm/ajv-formats@3/dist/ajv-formats.min.js')
    ])
    const ajv = new Ajv({ allErrors: true, strict: false })
    addFormats(ajv)
    const validate = ajv.compile(schema)
    const valid = !!validate(data)
    return {
      valid,
      errors: valid ? [] : (validate.errors || []).map(e => {
        const path = e.instancePath || e.schemaPath || ''
        return path ? `${path} ${e.message}` : e.message || 'Validation error'
      })
    }
  } catch (e) {
    return {
      valid: false,
      errors: [e?.message || 'Schema validation failed']
    }
  }
}
export default validateJSON;
// Generation time: 2.663s
// Result: FAIL