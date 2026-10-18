export const normalizeUpc = (value) => {
  if (value == null || (typeof value === 'string' && !value.trim())) return null;
  if (typeof value !== 'string') return undefined;

  const upc = value.replace(/[\s-]/g, '');
  if (!/^\d{12}$/.test(upc)) return undefined;
  const digits = [...upc].map(Number);
  const checkSum = digits.slice(0, 11).reduce((sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (checkSum % 10)) % 10 === digits[11] ? upc : undefined;
};
