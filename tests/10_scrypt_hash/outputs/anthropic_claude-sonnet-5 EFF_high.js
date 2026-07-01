async function hashPassword(password, salt) {
  const { default: scrypt } = await import('https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm');

  const enc = new TextEncoder();
  const passBuf = enc.encode(password);
  const saltBuf = enc.encode(salt);

  const N = 1024, r = 8, p = 1, dkLen = 32;
  const derivedKey = await scrypt(passBuf, saltBuf, N, r, p, dkLen);

  return Array.from(derivedKey, b => b.toString(16).padStart(2, '0')).join('');
}
export default hashPassword;
// Generation time: 4.636s
// Result: FAIL