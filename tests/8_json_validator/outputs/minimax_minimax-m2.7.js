async function validateJSON(data, schema) {
  const Ajv = (await import('https://cdn.jsdelivr.net/npm/ajv@8/dist/ajv.bundle.min.js')).default;
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(data);
  const errors = valid ? [] : validate.errors.map(e => `${e.instancePath || '/'}: ${e.message}`);
  return { valid, errors };
}
export default validateJSON;
// Generation time: 25.859s
// Result: FAIL