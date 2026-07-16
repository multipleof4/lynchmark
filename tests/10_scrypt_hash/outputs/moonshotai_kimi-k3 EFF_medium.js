const SCRYPT_URL = "https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm";

async function hashPassword(password, salt) {
  const { scrypt } = await import(SCRYPT_URL);
  const enc = new TextEncoder();
  const hash = await scrypt(enc.encode(password), enc.encode(salt), 1024, 8, 1, 32);
  return Array.from(hash, b => b.toString(16).padStart(2, "0")).join("");
}
export default hashPassword;
// Generation time: 36.726s
// Result: PASS