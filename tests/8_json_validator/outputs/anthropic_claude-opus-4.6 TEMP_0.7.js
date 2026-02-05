async function validateJSON(json, schema) {
  const Ajv = (await import("https://esm.sh/ajv@8")).default;
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(json);
  return {
    valid: !!valid,
    errors: valid ? [] : validate.errors.map(e =>
      `${e.instancePath ? e.instancePath + " " : ""}${e.message}`
    )
  };
}
export default validateJSON;
// Generation time: 4.304s
// Result: PASS