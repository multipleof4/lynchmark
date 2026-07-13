async function hashPassword(password, salt) {
  const scryptModule = await import(
    "https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm"
  );
  const scrypt = scryptModule.default ?? scryptModule.scrypt;

  const passwordBytes = new TextEncoder().encode(password);
  const saltBytes = new TextEncoder().encode(salt);
  const hash = await scrypt(passwordBytes, saltBytes, 1024, 8, 1, 32);

  return Array.from(hash, byte => byte.toString(16).padStart(2, "0")).join("");
}
export default hashPassword;
// Generation time: 8.694s
// Result: FAIL