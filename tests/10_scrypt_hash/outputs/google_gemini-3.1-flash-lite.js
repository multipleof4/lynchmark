async function hashPassword(password, salt) {
  const { scrypt } = await import('https://esm.run/scrypt-js');
  const enc = new TextEncoder();
  
  const key = await scrypt(
    enc.encode(password),
    enc.encode(salt),
    1024, 8, 1, 32
  );

  return [...key].map(b => b.toString(16).padStart(2, '0')).join('');
}
export default hashPassword;
// Generation time: 1.123s
// Result: PASS