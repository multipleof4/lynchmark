async function hashPassword(password, salt) {
  const scrypt = (await import('https://unpkg.com/scrypt-js')).default;
  const t = new TextEncoder;
  const h = await scrypt(t.encode(password), t.encode(salt), 1024, 8, 1, 32);
  return [...h].map(b => b.toString(16).padStart(2, '0')).join('');
}
export default hashPassword;
// Generation time: 47.029s
// Result: FAIL