let ajv;

const validateJSON = async (data, schema) => {
  try {
    if (!ajv) {
      const Ajv = (await import('https://esm.sh/ajv@8.17.1')).default;
      ajv = new Ajv({ allErrors: true, strict: false });
    }
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return {
      valid,
      errors: valid ? [] : validate.errors.map(e => `${e.instancePath || '/'}: ${e.message}`)
    };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
};
export default validateJSON;
// Generation time: 45.178s
// Result: PASS