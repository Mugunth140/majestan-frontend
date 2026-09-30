// site/majestan-frontend/src/lib/property-format.ts
// Price/date rendering shared by the property info sidebar wherever it is
// shown (overview and sub-pages). Moved verbatim out of PropertyDetailsView.

export function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  if (num === 0) return "Price on Request";
  if (num >= 10000000)
    return `₹ ${(num / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (num >= 100000)
    return `₹ ${(num / 100000).toFixed(2).replace(/\.?0+$/, "")} Lakh`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
