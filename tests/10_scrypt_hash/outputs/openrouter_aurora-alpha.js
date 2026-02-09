async function hashPassword(p, s) {
  const e = new TextEncoder(),
        pU = e.encode(p),
        sU = e.encode(s),
        { scrypt } = await import('https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/dist/scrypt.esm.js');
  const dk = await scrypt(pU, sU, 1024, 8, 1, 32);
  let h = '';
  for (let i = 0; i < dk.length; i++) h += dk[i].toString(16).padStart(2, '0');
  return h;
}
export default hashPassword;
// Generation time: 1.126s
// Result: FAIL