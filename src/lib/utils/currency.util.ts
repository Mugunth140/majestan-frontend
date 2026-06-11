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

export function numberToIndianWords(num: number): string {
    if (isNaN(num) || num === 0) return "";
    
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const formatDecimals = (n: number, suffix: string) => {
        if (n === 0) return '';
        if (n < 20) return a[n] + suffix;
        return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ' + suffix;
    };

    let words = '';
    let temp = Math.floor(num);
    
    const cr = Math.floor(temp / 10000000);
    temp -= cr * 10000000;
    const lk = Math.floor(temp / 100000);
    temp -= lk * 100000;
    const th = Math.floor(temp / 1000);
    temp -= th * 1000;
    const h = Math.floor(temp / 100);
    temp -= h * 100;

    if (cr > 0) words += formatDecimals(cr, 'Crore ');
    if (lk > 0) words += formatDecimals(lk, 'Lakh ');
    if (th > 0) words += formatDecimals(th, 'Thousand ');
    if (h > 0) words += formatDecimals(h, 'Hundred ');
    
    if (temp > 0) {
        if (words !== '') words += 'and ';
        words += formatDecimals(temp, '');
    }
    
    return words.replace(/\s+/g, ' ').trim() + " Rupees";
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
