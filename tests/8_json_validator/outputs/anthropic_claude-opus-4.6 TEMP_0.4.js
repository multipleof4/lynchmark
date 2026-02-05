async function validateJSON(json, schema) {
  const { default: Ajv } = await import("https://esm.sh/ajv@8");
  const ajv = new Ajv({ allErrors: true });
  const valid = ajv.validate(schema, json);
  return {
    valid,
    errors: valid ? [] : ajv.errors.map(e => `${e.instancePath || "/"} ${e.message}`)
  };
}
export default validateJSON;
// Generation time: 3.592s
// Result: PASS