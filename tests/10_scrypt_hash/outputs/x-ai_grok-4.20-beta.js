export async function hashPassword(p,s){
    const m=await import('https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm');
    const e=new TextEncoder();
    const h=await m.scrypt(e.encode(p),e.encode(s),1024,8,1,32);
    return Array.from(h).map(x=>x.toString(16).padStart(2,'0')).join('');
}
export default hashPassword;
// Generation time: 0.676s
// Result: PASS