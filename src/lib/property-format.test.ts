// site/majestan-frontend/src/lib/property-format.test.ts
import { describe, expect, it } from "vitest";
import { formatPrice, formatDate } from "./property-format";

describe("formatPrice", () => {
  it("formats crores and lakhs", () => {
    expect(formatPrice("14500000")).toBe("₹ 1.45 Cr");
    // Trailing zeros are stripped by the existing formatter.
    expect(formatPrice("250000")).toBe("₹ 2.5 Lakh");
  });

  it("handles zero and non-numeric input", () => {
    expect(formatPrice("0")).toBe("Price on Request");
    expect(formatPrice("abc")).toBe("abc");
  });
});

describe("formatDate", () => {
  it("renders a short Indian date", () => {
    // Midday UTC keeps the calendar day stable across timezones.
    expect(formatDate("2026-06-15T12:00:00.000Z")).toBe("15 Jun 2026");
  });
});
