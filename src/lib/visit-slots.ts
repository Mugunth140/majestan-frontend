/** Hourly visit start-times (IST wall-clock). Mirrored in site backend create-property-enquiry.dto.ts. */
export const VISIT_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] as const;
export type VisitSlot = (typeof VISIT_SLOTS)[number];

export function formatSlot(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Today's calendar date YYYY-MM-DD using manual string building (avoids ICU risk with toLocaleDateString). */
export function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isValidVisitSlot(slot: string): boolean {
  return (VISIT_SLOTS as readonly string[]).includes(slot);
}

/** Latest bookable visit date: 3 calendar months from today, YYYY-MM-DD. */
export function maxVisitDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isValidVisitDate(ymd: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(ymd) && ymd >= todayYmd() && ymd <= maxVisitDate();
}
