async function hashPassword(p, s) {
  const e = new TextEncoder;
  const { default: scrypt } = await import('https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm');
  const h = await scrypt(e.encode(p), e.encode(s), 1024, 8, 1, 32);
  return [...h].map(b => (b < 16 ? '0' : '') + b.toString(16)).join('');
}
export default hashPassword;
// Generation time: 58.113s
// Result: FAIL