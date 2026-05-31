const validateJSON = async (data, schema) => {
  try {
    const { default: Ajv } = await import("https://esm.sh/ajv@8");
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return {
      valid,
      errors: valid
        ? []
        : (validate.errors || []).map(
            (e) => `${e.instancePath || "/"} ${e.message}`.trim()
          ),
    };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
};

export { validateJSON };
export default validateJSON;
// Generation time: 5.406s
// Result: PASS