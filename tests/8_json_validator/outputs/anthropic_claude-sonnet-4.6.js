async function validateJSON(data, schema) {
  const CDN = "https://cdn.jsdelivr.net/npm/ajv@8/dist/ajv2020.min.js";

  const module = await import(CDN);
  const Ajv = module.default ?? module;

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid,
    errors: valid
      ? []
      : validate.errors.map(
          ({ instancePath, message, params }) =>
            `${instancePath || "root"}: ${message} ${JSON.stringify(params)}`
        ),
  };
}
export default validateJSON;
// Generation time: 3.415s
// Result: FAIL