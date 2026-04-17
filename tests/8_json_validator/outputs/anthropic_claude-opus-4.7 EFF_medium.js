const validateJSON = async (data, schema) => {
  const { default: Ajv } = await import('https://cdn.jsdelivr.net/npm/ajv@8/+esm');
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return {
    valid,
    errors: valid ? [] : validate.errors.map(e => `${e.instancePath || '/'} ${e.message}`)
  };
};
export default validateJSON;
// Generation time: 2.748s
// Result: PASS