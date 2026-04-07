async function hashPassword(password, salt) {
  const { scrypt } = await import('https://esm.sh/scrypt-js')
  const e = new TextEncoder()
  const h = await scrypt(e.encode(password), e.encode(salt), 1024, 8, 1, 32)
  return [...h].map(b => b.toString(16).padStart(2, '0')).join('')
}
export default hashPassword;
// Generation time: 33.046s
// Result: PASS