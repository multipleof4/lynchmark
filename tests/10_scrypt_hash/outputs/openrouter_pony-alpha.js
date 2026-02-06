const hashPassword = async (password, salt) => {
  const { default: scrypt } = await import('https://esm.sh/scrypt-js');
  const encode = s => new TextEncoder().encode(s);
  const hash = await scrypt(encode(password), encode(salt), 1024, 8, 1, 32);
  return [...hash].map(b => b.toString(16).padStart(2, '0')).join('');
};
export default hashPassword;
// Generation time: 76.203s
// Result: FAIL