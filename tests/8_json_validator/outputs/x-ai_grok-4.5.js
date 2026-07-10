async function validateJSON(data,schema){
const{default:Ajv}=await import("https://esm.sh/ajv@8");
const ajv=new Ajv({allErrors:true});
const validate=ajv.compile(schema);
const valid=validate(data);
return{valid,errors:valid?[]:validate.errors.map(e=>(e.instancePath+" "+e.message).trim())}
}
export default validateJSON;
// Generation time: 13.050s
// Result: PASS