const validateJSON = async (data, schema) => {
  const { default: Ajv } = await import('https://esm.sh/ajv');
  const ajv = new Ajv();
  const valid = ajv.validate(schema, data);
  return { valid, errors: ajv.errors?.map(e => e.message) || [] };
};
export default validateJSON;
// Generation time: 57.602s
// Result: PASS