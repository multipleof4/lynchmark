const validateJSON = async (json, schema) => {
  const { default: Ajv } = await import('https://esm.sh/ajv');
  const validate = new Ajv().compile(schema);
  const valid = validate(json);
  return {
    valid,
    errors: valid ? [] : validate.errors.map(e => `${e.instancePath} ${e.message}`)
  };
};
export default validateJSON;
// Generation time: 103.740s
// Result: PASS