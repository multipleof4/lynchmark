export async function hashPassword(password, salt) {
  const { scrypt } = await import('https://cdn.jsdelivr.net/npm/scrypt-js/+esm');
  const { encode } = new TextEncoder();
  const hash = await scrypt(encode(password), encode(salt), 1024, 8, 1, 32);
  return [...hash].map(b => b.toString(16).padStart(2, '0')).join('');
}
export default hashPassword;
// Generation time: 47.834s
// Result: FAIL