const validateJSON = async (d, s) => {
  try {
    const { default: Ajv } = await import('https://esm.sh/ajv@8.12.0');
    const v = new Ajv({ allErrors: true }).compile(s);
    const valid = v(d);
    return {
      valid,
      errors: valid ? [] : v.errors.map(e => `${e.instancePath || 'root'}: ${e.message}`)
    };
  } catch (e) {
    return { valid: false, errors: [e.message] };
  }
};
export default validateJSON;
// Generation time: 27.586s
// Result: PASS