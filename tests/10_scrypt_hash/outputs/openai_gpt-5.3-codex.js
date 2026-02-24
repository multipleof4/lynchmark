async function hashPassword(password, salt) {
  if (typeof password !== 'string' || typeof salt !== 'string') throw new TypeError('password and salt must be strings')
  const { scrypt: named, default: def } = await import('https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm')
  const scrypt = named || def?.scrypt || def
  if (typeof scrypt !== 'function') throw new Error('Failed to load scrypt function')
  const enc = new TextEncoder()
  const hash = await scrypt(enc.encode(password), enc.encode(salt), 1024, 8, 1, 32)
  return Array.from(hash, b => b.toString(16).padStart(2, '0')).join('')
}
export default hashPassword;
// Generation time: 7.962s
// Result: PASS