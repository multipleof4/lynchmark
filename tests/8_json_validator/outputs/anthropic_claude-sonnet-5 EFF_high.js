async function validateJSON(data, schema) {
  const { default: Ajv } = await import('https://cdn.jsdelivr.net/npm/ajv@8/+esm');

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(data);

  const errors = valid
    ? []
    : validate.errors.map(({ instancePath, message, params }) => {
        const path = instancePath || '/';
        const extra = params?.missingProperty
          ? ` (missing: ${params.missingProperty})`
          : '';
        return `${path}: ${message}${extra}`;
      });

  return { valid, errors };
}
export default validateJSON;
// Generation time: 6.311s
// Result: PASS