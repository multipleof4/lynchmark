export const validateJSON = async (d, s) => {
  const { default: A } = await import("https://esm.sh/ajv@8");
  const v = new A({ allErrors: true }).compile(s);
  const k = v(d);
  
  return {
    valid: k,
    errors: k ? [] : v.errors.map(e => `${e.instancePath || "/"} ${e.message}`.trim())
  };
};
export default validateJSON;
// Generation time: 16.896s
// Result: PASS