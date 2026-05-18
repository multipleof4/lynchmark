async function validateJSON(data, schema) {
  const { default: Ajv } = await import('https://esm.sh/ajv@8.12.0');
  const { default: addFormats } = await import('https://esm.sh/ajv-formats@2.1.1');
  
  const ajv = new (Ajv)({ allErrors: true });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid,
    errors: valid ? [] : validate.errors.map(e => `${e.instancePath} ${e.message}`)
  };
}
export default validateJSON;
// Generation time: 1.038s
// Result: PASS