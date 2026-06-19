const hashPassword = async (password, salt) => {
  const { default: scrypt } = await import('https://esm.sh/scrypt-js');
  const enc = new TextEncoder();
  const hash = await scrypt(enc.encode(password), enc.encode(salt), 1024, 8, 1, 32);
  return Array.from(hash, b => b.toString(16).padStart(2, '0')).join('');
};
export default hashPassword;
// Generation time: 16.829s
// Result: FAIL