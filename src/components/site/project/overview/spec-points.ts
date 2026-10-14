/** The CRM saves up to this many points per specification label. */
export const MAX_SPEC_POINTS = 5;

/**
 * A specification's value as points. The CRM stores each point on its own
 * line; values saved before points existed are one paragraph, which is split
 * into its sentences so they still read as a list. Sentences are not capped:
 * dropping part of an old value would hide a spec the buyer was promised.
 */
export function specPoints(value: string): string[] {
  const lines = value
    .split("\n")
    .map((line) => line.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);
  if (lines.length > 1) return lines.slice(0, MAX_SPEC_POINTS);
  const sentences = (lines[0] ?? "")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences;
}
