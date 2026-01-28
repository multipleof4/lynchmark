const hashPassword = async (p, s) => {
  const { scrypt } = await import('https://esm.sh/scrypt-js@3.0.1');
  const t = new TextEncoder();
  const r = await scrypt(t.encode(p), t.encode(s), 1024, 8, 1, 32);
  return Array.from(r, x => x.toString(16).padStart(2, '0')).join('');
};
export default hashPassword;
// Generation time: 36.319s
// Result: PASS