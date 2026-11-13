/**
 * Property IDs as shown on listings ("ID: AP8471", "V012", "PROP-1712…").
 * Codes are a short letter prefix plus digits; the backend pads the number to
 * at least three digits (AP008).
 */

const PREFIX_WORDS = /^(?:#|property\s*id|prop(?:erty)?\s*code|id|ref)\s*[:#-]?\s*/i;
const CODE = /^([a-z]{1,6})[\s-]?(\d{1,13})$/i;

/**
 * If the search text looks like a property ID, the codes to try, most
 * likely first. Returns [] for ordinary search text ("3 bhk peelamedu").
 */
export function propertyIdCandidates(input: string): string[] {
  const text = input.trim().replace(PREFIX_WORDS, "").trim();
  const match = text.match(CODE);
  if (!match) return [];
  const prefix = match[1].toUpperCase();
  const digits = match[2];
  // Plain words with a number ("bhk3", "flat2") are not IDs worth a lookup
  // unless they carry the usual 3+ digits or an explicit "ID"/"#" marker.
  const marked = PREFIX_WORDS.test(input.trim());
  if (!marked && digits.length < 3) return [];
  const candidates = [`${prefix}${digits}`, `${prefix}-${digits}`];
  if (digits.length < 3) candidates.push(`${prefix}${digits.padStart(3, "0")}`);
  return [...new Set(candidates)];
}
