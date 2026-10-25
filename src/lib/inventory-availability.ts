/** Availability is based only on the inventory status, never on dates or SEO settings. */
export function inventoryAvailability(status: unknown): string | null {
  const value = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[ -]+/g, "_");
  if (!value || value === "available" || value === "published") return null;
  if (value === "booked") return "Sold Out";
  if (
    ["sold", "sold_out", "soldout", "unavailable", "archived"].includes(value)
  )
    return "Sold Out";
  if (value === "rented") return "Sold Out";
  return "Unavailable";
}
