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

/**
 * Display value for the Furnishing row. Prefers the CRM's furnishing-status
 * dropdown value (SEMI FURNISHED, FULLY FURNISHED, BARESHELL, UNFURNISHED),
 * falling back to the legacy `furnished` checkbox flag. Null when neither is
 * stored, so the row hides instead of showing a blank.
 */
export function formatFurnishing(details: {
  furnished?: boolean | null;
  furnishingStatus?: string | null;
} | null | undefined): string | null {
  const status = details?.furnishingStatus?.trim();
  if (status) {
    return status
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");
  }
  if (details?.furnished != null) return details.furnished ? "Furnished" : "Unfurnished";
  return null;
}
