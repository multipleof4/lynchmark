async function hashPassword(password, salt) {
  const { scrypt } = await import('https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm');
  const encode = str => new TextEncoder().encode(str);
  const hash = await scrypt(encode(password), encode(salt), 1024, 8, 1, 32);
  return Array.from(hash, b => b.toString(16).padStart(2, '0')).join('');
}
export default hashPassword;
// Generation time: 7.014s
// Result: PASS