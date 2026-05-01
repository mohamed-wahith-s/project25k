const getNormalizedCodeVariants = (code) => {
  if (!code) return [];
  const s = String(code).trim();
  const variants = new Set([s]);
  
  // Handle leading zeros
  const withoutZeros = s.replace(/^0+/, '');
  if (withoutZeros) variants.add(withoutZeros);
  
  // Add common padding (usually 1-4 digits)
  if (withoutZeros.length === 1) variants.add(`0${withoutZeros}`);
  if (withoutZeros.length === 2) variants.add(`00${withoutZeros}`); // Some use 00xx
  if (withoutZeros.length === 3) variants.add(`0${withoutZeros}`);

  return Array.from(variants);
};

console.log('1:', getNormalizedCodeVariants('1'));
console.log('01:', getNormalizedCodeVariants('01'));
console.log('02:', getNormalizedCodeVariants('02'));
console.log('2:', getNormalizedCodeVariants('2'));
console.log('123:', getNormalizedCodeVariants('123'));
console.log('0123:', getNormalizedCodeVariants('0123'));
