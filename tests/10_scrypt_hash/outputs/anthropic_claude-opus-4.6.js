async function hashPassword(password, salt) {
  const { scrypt } = await import("https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm");
  const enc = new TextEncoder();
  const passwordBytes = enc.encode(password);
  const saltBytes = enc.encode(salt);
  const hash = await scrypt(passwordBytes, saltBytes, 1024, 8, 1, 32);
  return Array.from(hash, b => b.toString(16).padStart(2, "0")).join("");
}
export default hashPassword;
// Generation time: 3.140s
// Result: PASS