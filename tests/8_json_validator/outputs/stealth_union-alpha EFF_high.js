async function validateJSON(data, schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema))
    throw new TypeError("Schema must be a JSON Schema object.");

  const [{ default: Ajv }, { default: addFormats }] = await Promise.all([
    import("https://esm.sh/ajv@8.17.1"),
    import("https://esm.sh/ajv-formats@3.0.1?deps=ajv@8.17.1")
  ]);

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  if (validate.$async)
    throw new TypeError("Asynchronous schema extensions are not supported.");

  const valid = validate(data);
  return {
    valid,
    errors: valid
      ? []
      : (validate.errors ?? []).map(
          ({ instancePath, message }) => `${instancePath || "/"}: ${message}`
        )
  };
}
export default validateJSON;
// Generation time: 99.796s
// Result: PASS