let A;
const validateJSON = async (json, schema) => {
  try {
    A ||= (await import('https://cdn.jsdelivr.net/npm/ajv@8.12.0/dist/ajv.mjs')).default;
    const v = new A({ allErrors: !0, strict: !1 }).compile(schema);
    const valid = v(json);
    return {
      valid,
      errors: valid ? [] : v.errors.map(e => `${e.instancePath || '/'} ${e.message}`.trim())
    };
  } catch (e) {
    return { valid: !1, errors: [e.message] };
  }
};
export default validateJSON;
// Generation time: 65.490s
// Result: FAIL