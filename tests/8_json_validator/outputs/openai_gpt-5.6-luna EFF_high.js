let ajvPromise;

const getAjv = () => {
  if (ajvPromise) return ajvPromise;

  ajvPromise = import("https://esm.sh/ajv@8.17.1")
    .then(({ default: Ajv }) => Ajv)
    .catch(error => {
      ajvPromise = null;
      throw error;
    });

  return ajvPromise;
};

const formatError = ({ instancePath, message }) =>
  `${instancePath || "$"} ${message}`;

async function validateJSON(value, schema) {
  try {
    const Ajv = await getAjv();
    const validate = new Ajv({
      allErrors: true,
      strict: false
    }).compile(schema);

    const valid = validate(value);

    return {
      valid,
      errors: valid ? [] : (validate.errors || []).map(formatError)
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}
export default validateJSON;
// Generation time: 15.651s
// Result: PASS