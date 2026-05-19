export async function validateJSON(data, schema) {
  const { default: Ajv } = await import('https://cdn.jsdelivr.net/npm/ajv@8/+esm');
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  const valid = validate(data);

  return {
    valid,
    errors: valid ? [] : validate.errors.map(e => `${e.instancePath || 'root'} ${e.message}`)
  };
}
export default validateJSON;
// Generation time: 6.256s
// Result: PASS