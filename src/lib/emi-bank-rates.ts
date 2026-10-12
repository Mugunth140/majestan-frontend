/**
 * Lender starting rates, October 2026.
 * Floors marked OFFICIAL were read from the lender's own rate page;
 * the rest are the freshest published figures (financial press, Oct 2026)
 * because those banks' sites block scraping or render rates via script.
 * Rates move with every RBI policy — this file carries its date and gets
 * refreshed by hand. No auto-fetching, no backend.
 */
export const BANK_RATES_UPDATED = "October 2026";

export type BankRate = {
  lender: string;
  type: "Public sector" | "Private" | "HFC";
  floorPct: number;
  range: string;
};

export const BANK_RATES: BankRate[] = [
  // Official lender pages (verified Oct 2026, post repo-hike to 5.50%).
  { lender: "Bank of Maharashtra", type: "Public sector", floorPct: 7.25, range: "7.25 – 9.90%" },
  { lender: "Central Bank of India", type: "Public sector", floorPct: 7.25, range: "7.25 – 9.50%" },
  { lender: "Bajaj Housing Finance", type: "HFC", floorPct: 7.25, range: "7.25 – 10.25%" },
  { lender: "ICICI Bank", type: "Private", floorPct: 7.55, range: "7.55% onwards" },
  { lender: "HDFC Bank", type: "Private", floorPct: 8.0, range: "8.00 – 13.45%" },
  { lender: "South Indian Bank", type: "Private", floorPct: 8.5, range: "8.50% onwards" },
  // Freshest published figures (press, Oct 2026) — bank sites block verification.
  { lender: "Bank of India", type: "Public sector", floorPct: 7.1, range: "7.10 – 10.25%" },
  { lender: "Indian Bank", type: "Public sector", floorPct: 7.15, range: "7.15 – 9.15%" },
  { lender: "Canara Bank", type: "Public sector", floorPct: 7.15, range: "7.15 – 10.00%" },
  { lender: "Union Bank of India", type: "Public sector", floorPct: 7.15, range: "7.15 – 9.60%" },
  { lender: "LIC Housing Finance", type: "HFC", floorPct: 7.15, range: "7.15 – 10.30%" },
  { lender: "Bank of Baroda", type: "Public sector", floorPct: 7.2, range: "7.20 – 9.25%" },
  { lender: "State Bank of India", type: "Public sector", floorPct: 7.25, range: "7.25% onwards" },
  { lender: "Axis Bank", type: "Private", floorPct: 8.0, range: "8.00 – 11.90%" },
];
