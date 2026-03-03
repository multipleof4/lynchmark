async function hashPassword(pwd, salt) {
  const { scrypt } = await import('https://esm.run/scrypt-js');
  const enc = new TextEncoder();
  
  const h = await scrypt(
    enc.encode(pwd),
    enc.encode(salt),
    1024, 8, 1, 32
  );

  return Array.from(h)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
export default hashPassword;
// Generation time: 1.026s
// Result: PASS