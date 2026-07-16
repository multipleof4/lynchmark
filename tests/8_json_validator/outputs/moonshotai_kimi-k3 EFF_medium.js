let ajvPromise;

const loadAjv = async () => {
  const [{ default: Ajv }, { default: addFormats }] = await Promise.all([
    import("https://esm.sh/ajv@8.17.1"),
    import("https://esm.sh/ajv-formats@3.0.1"),
  ]);
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
};

const getAjv = () =>
  (ajvPromise ??= loadAjv().catch((error) => {
    ajvPromise = undefined;
    throw error;
  }));

async function validateJSON(data, schema) {
  try {
    const validate = (await getAjv()).compile(schema);
    const valid = validate(data);
    return {
      valid,
      errors: (validate.errors ?? []).map(
        ({ instancePath, message }) => `${instancePath || "(root)"} ${message}`,
      ),
    };
  } catch (error) {
    return { valid: false, errors: [error?.message ?? String(error)] };
  }
}
export default validateJSON;
// Generation time: 91.986s
// Result: PASS