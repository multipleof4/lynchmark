const _jsonSchema = (() => {
  const ajvs = new Map();
  const vals = new WeakMap();
  const opts = {
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
    addUsedSchema: false,
    validateFormats: true
  };

  const ver = s => {
    s = `${s && typeof s == "object" && s.$schema || ""}`;
    return s.includes("2020-12") ? "2020" : s.includes("2019-09") ? "2019" : "7";
  };

  const url = v => `https://esm.sh/ajv@8.17.1${v == "7" ? "" : `/dist/${v}`}?bundle`;

  const load = v => {
    let p = ajvs.get(v);
    if (p) return p;

    p = Promise.all([
      import(url(v)),
      import("https://esm.sh/ajv-formats@3.0.1?bundle&deps=ajv@8.17.1")
    ]).then(([a, f]) => {
      const Ajv = a.default || a.Ajv || a;
      const addFormats = f.default || f.addFormats || f;
      const ajv = new Ajv({ ...opts });
      addFormats(ajv);
      return ajv;
    }).catch(e => {
      ajvs.delete(v);
      throw e;
    });

    ajvs.set(v, p);
    return p;
  };

  const part = s => /^(0|[1-9]\d*)$/.test(s)
    ? `[${s}]`
    : /^[A-Za-z_$][\w$]*$/.test(s)
      ? `.${s}`
      : `[${JSON.stringify(s)}]`;

  const loc = p => p
    ? `$${p.split("/").slice(1).map(s => part(s.replace(/~1/g, "/").replace(/~0/g, "~"))).join("")}`
    : "$";

  const msg = e => {
    const x = e.params || {};
    const extra = e.keyword == "additionalProperties"
      ? `: ${x.additionalProperty}`
      : e.keyword == "required"
        ? `: ${x.missingProperty}`
        : "";

    return `${loc(e.instancePath)} ${e.message || "is invalid"}${extra}`;
  };

  return { load, vals, ver, msg };
})();

async function validateJSON(data, schema) {
  const isSchema = typeof schema == "boolean" ||
    schema && typeof schema == "object" && !Array.isArray(schema);

  if (!isSchema) {
    return {
      valid: false,
      errors: ["Schema must be a JSON Schema object or boolean"]
    };
  }

  try {
    const cacheable = schema && typeof schema == "object";
    let validate = cacheable && _jsonSchema.vals.get(schema);

    if (!validate) {
      const ajv = await _jsonSchema.load(_jsonSchema.ver(schema));
      validate = ajv.compile(schema);
      if (cacheable) _jsonSchema.vals.set(schema, validate);
    }

    const valid = validate(data);

    return {
      valid,
      errors: valid ? [] : (validate.errors || []).map(_jsonSchema.msg)
    };
  } catch (e) {
    return {
      valid: false,
      errors: [e?.message || String(e)]
    };
  }
}
export default validateJSON;
// Generation time: 143.247s
// Result: PASS