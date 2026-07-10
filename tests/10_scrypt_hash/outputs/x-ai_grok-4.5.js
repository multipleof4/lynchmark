async function hashPassword(password,salt){
const{default:scrypt}=await import("https://esm.sh/scrypt-js@3.0.1");
const enc=new TextEncoder;
const p=enc.encode(password),s=enc.encode(salt);
const hash=await scrypt(p,s,1024,8,1,32);
return Array.from(hash).map(b=>b.toString(16).padStart(2,"0")).join("")
}
export default hashPassword;
// Generation time: 22.963s
// Result: FAIL