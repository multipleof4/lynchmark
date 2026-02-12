async function validateJSON(data, schema) {
  try {
    const { default: Ajv } = await import('https://esm.sh/ajv@8');
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return { valid, errors: valid ? [] : validate.errors.map(e => e.message) };
  } catch (e) {
    return { valid: false, errors: [e.message] };
  }
}
export default validateJSON;
// Generation time: 35.988s
// Result: PASS