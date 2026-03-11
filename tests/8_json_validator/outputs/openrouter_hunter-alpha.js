async function validateJSON(data, schema) {
  try {
    const { default: Ajv } = await import('https://cdn.jsdelivr.net/npm/ajv@8/+esm');
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    return {
      valid,
      errors: valid ? [] : validate.errors.map(e => 
        `${e.instancePath || '/'} ${e.message}`
      )
    };
  } catch (error) {
    return { valid: false, errors: [`Validation error: ${error.message}`] };
  }
}
export default validateJSON;
// Generation time: 20.147s
// Result: PASS