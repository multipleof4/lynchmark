let ajvReady;

const getAjv = () =>
  ajvReady ??= (async () => {
    const { default: Ajv } = await import("https://esm.sh/ajv@8");
    return new Ajv({ allErrors: true, strict: false });
  })();

async function validateJSON(data, schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return { valid: false, errors: ["Schema must be a JSON object"] };
  }

  let validate;
  try {
    const ajv = await getAjv();
    validate = ajv.compile(schema);
  } catch (e) {
    return { valid: false, errors: [`Invalid schema: ${e?.message || String(e)}`] };
  }

  const valid = !!validate(data);
  const errors = valid
    ? []
    : (validate.errors || []).map(
        e => `${e.instancePath || "/"} ${e.message || "is invalid"}`
      );

  return { valid, errors };
}
export default validateJSON;
// Generation time: 20.276s
// Result: PASS