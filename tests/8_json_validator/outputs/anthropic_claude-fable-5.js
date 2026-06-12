const validateJSON = (() => {
  let ajv;

  const load = async () => {
    if (ajv) return ajv;
    const [{ default: Ajv }, { default: addFormats }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/ajv@8/+esm'),
      import('https://cdn.jsdelivr.net/npm/ajv-formats@3/+esm')
    ]);
    ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    return ajv;
  };

  const format = e =>
    `${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? `: ${e.params.allowedValues.join(', ')}` : ''}`;

  return async (data, schema) => {
    try {
      const validator = (await load()).compile(schema);
      const valid = validator(data);
      return { valid, errors: valid ? [] : validator.errors.map(format) };
    } catch (err) {
      return { valid: false, errors: [`Schema error: ${err.message}`] };
    }
  };
})();
export default validateJSON;
// Generation time: 13.342s
// Result: PASS