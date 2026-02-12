async function hashPassword(pwd,salt){
  const{scrypt}=await import('https://cdn.skypack.dev/scrypt-js');
  const pw=new TextEncoder().encode(pwd);
  const st=new TextEncoder().encode(salt);
  const h=await scrypt(pw,st,1024,8,1,32);
  return Array.from(h).map(b=>b.toString(16).padStart(2,'0')).join('');
}
export default hashPassword;
// Generation time: 30.558s
// Result: PASS