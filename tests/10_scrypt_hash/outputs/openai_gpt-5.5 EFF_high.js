const SCRYPT_CDN = 'https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm';

async function hashPassword(password, salt) {
  if (typeof password !== 'string' || typeof salt !== 'string')
    throw new TypeError('password and salt must be strings');

  const { scrypt } = await import(SCRYPT_CDN);
  const enc = new TextEncoder();
  const hash = await scrypt(
    enc.encode(password),
    enc.encode(salt),
    1024,
    8,
    1,
    32
  );

  return [...hash]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
export default hashPassword;
// Generation time: 12.627s
// Result: PASS