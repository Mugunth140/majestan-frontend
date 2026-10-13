export function parseIndianCurrency(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === '') return NaN;
  if (typeof val === 'number') return val;
  
  let cleaned = val.toString().toLowerCase().replace(/,/g, '').trim();
  let multiplier = 1;
  
  if (cleaned.match(/(cr|crores|crore)$/)) {
    multiplier = 10000000;
    cleaned = cleaned.replace(/cr|crores|crore/g, '').trim();
  } else if (cleaned.match(/(lk|lakhs|lakh|lak|l)$/)) {
    multiplier = 100000;
    cleaned = cleaned.replace(/lakhs|lakh|lak|lk|l/g, '').trim();
  } else if (cleaned.match(/(k|thousand|thousands)$/)) {
    multiplier = 1000;
    cleaned = cleaned.replace(/thousands|thousand|k/g, '').trim();
  }

  const num = Number(cleaned);
  if (isNaN(num)) return NaN;
  return num * multiplier;
}

const INDIAN_ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const INDIAN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function underHundred(value: number): string {
  if (value < 20) return INDIAN_ONES[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return ones ? `${INDIAN_TENS[tens]} ${INDIAN_ONES[ones]}` : INDIAN_TENS[tens];
}

function underThousand(value: number): string {
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  if (!hundreds) return underHundred(remainder);
  return remainder
    ? `${INDIAN_ONES[hundreds]} Hundred and ${underHundred(remainder)}`
    : `${INDIAN_ONES[hundreds]} Hundred`;
}

/** Converts a rupee amount into Indian number words, including paise. */
export function numberToIndianWords(num: number): string {
  if (!Number.isFinite(num) || num <= 0) return "";

  const totalPaise = Math.round(num * 100);
  const rupees = Math.floor(totalPaise / 100);
  const paise = totalPaise % 100;
  const parts: string[] = [];
  let remaining = rupees;

  const crore = Math.floor(remaining / 10_000_000);
  remaining -= crore * 10_000_000;
  const lakh = Math.floor(remaining / 100_000);
  remaining -= lakh * 100_000;
  const thousand = Math.floor(remaining / 1_000);
  remaining -= thousand * 1_000;
  const hundredGroup = Math.floor(remaining / 100);
  const lastTwo = remaining % 100;

  if (crore) parts.push(`${underThousand(crore)} Crore`);
  if (lakh) parts.push(`${underHundred(lakh)} Lakh`);
  if (thousand) parts.push(`${underHundred(thousand)} Thousand`);
  if (hundredGroup) parts.push(`${INDIAN_ONES[hundredGroup]} Hundred`);
  if (lastTwo) {
    if (parts.length) parts.push("and");
    parts.push(underHundred(lastTwo));
  }

  let words = parts.length ? `${parts.join(" ")} Rupees` : "";
  if (paise) {
    const paiseWords = underHundred(paise);
    words = words ? `${words} and ${paiseWords} Paise` : `${paiseWords} Paise`;
  }
  return words;
}

export function formatToShortIndianCurrency(val: number | string | null | undefined): string {
   if (val === undefined || val === null || val === '') return "";
   const num = Number(val);
   if (isNaN(num) || num === 0) return "";
   
   if (num >= 10000000) {
      return parseFloat((num / 10000000).toFixed(2)) + ' Cr';
   } else if (num >= 100000) {
      return parseFloat((num / 100000).toFixed(2)) + ' Lk';
   } else if (num >= 1000) {
      return parseFloat((num / 1000).toFixed(2)) + ' K';
   }
   return num.toString();
}
