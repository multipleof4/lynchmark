async function hashPassword(password, salt) {
  const { scrypt } = await import("https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm");
  const enc = new TextEncoder();
  const hash = await scrypt(enc.encode(password), enc.encode(salt), 1024, 8, 1, 32);
  return Array.from(hash, b => b.toString(16).padStart(2, "0")).join("");
}
export default hashPassword;
// Generation time: 2.342s
// Result: PASS