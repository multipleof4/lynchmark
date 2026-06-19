async function validateJSON(data, schema) {
  const { default: Ajv } = await import('https://esm.sh/ajv@8');
  const ajv = new Ajv({ allErrors: true });
  const valid = ajv.validate(schema, data);
  return { valid, errors: valid ? [] : ajv.errors.map(e => e.message) };
}
export default validateJSON;
// Generation time: 31.005s
// Result: PASS