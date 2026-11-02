/** Match the public API limits before forwarding untrusted URL filters. */
export function searchText(value: string | undefined, maxLength: number): string | undefined {
  const text = value?.trim();
  return text ? Array.from(text).slice(0, maxLength).join("") : undefined;
}

export function searchChoice(value: string | undefined, choices: readonly string[]): string | undefined {
  return value && choices.includes(value) ? value : undefined;
}

export function searchNumber(value: unknown, integer = false, min = 0): number | undefined {
  if (value === undefined || value === null || String(value).trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && (!integer || Number.isSafeInteger(number)) ? number : undefined;
}

export function searchPage(value: unknown): number {
  return searchNumber(value, true, 1) ?? 1;
}

export function searchLimit(value: unknown, fallback: number): number {
  return Math.min(searchNumber(value, true, 1) ?? fallback, 100);
}
