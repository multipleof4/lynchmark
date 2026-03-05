async function hashPassword(password, salt) {
  const { scrypt } = await import('https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm')
  const e = new TextEncoder()
  const hash = await scrypt(e.encode(password), e.encode(salt), 1024, 8, 1, 32)
  return [...hash].map(b => b.toString(16).padStart(2, '0')).join('')
}
export default hashPassword;
// Generation time: 1.666s
// Result: PASS