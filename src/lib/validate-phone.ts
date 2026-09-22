export function normalizeIndianPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (/^91[6-9]\d{9}$/.test(digits)) digits = digits.slice(2);
  else if (/^0[6-9]\d{9}$/.test(digits)) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}
