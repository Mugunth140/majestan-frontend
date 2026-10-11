import { describe, expect, it } from "vitest";
import { formatINR, formatINRRange } from "./projects";

describe("formatINR", () => {
  it("drops decimals that are zero", () => {
    expect(formatINR(9000000)).toBe("₹90 L");
    expect(formatINR(60000000)).toBe("₹6 Cr");
    expect(formatINR("9000000.00")).toBe("₹90 L");
  });

  it("drops only the trailing zero", () => {
    expect(formatINR(12000000)).toBe("₹1.2 Cr");
    expect(formatINR(4050000)).toBe("₹40.5 L");
  });

  it("keeps decimals that carry information", () => {
    expect(formatINR(4045000)).toBe("₹40.45 L");
    expect(formatINR(14600000)).toBe("₹1.46 Cr");
  });

  it("formats sub-lakh amounts in en-IN grouping", () => {
    expect(formatINR(85000)).toBe("₹85,000");
  });

  it("treats missing and zero as price on request", () => {
    expect(formatINR(null)).toBe("Price on Request");
    expect(formatINR(0)).toBe("Price on Request");
    expect(formatINR("")).toBe("Price on Request");
  });
});

describe("formatINRRange", () => {
  it("writes a shared unit once", () => {
    expect(formatINRRange(13000000, 14600000)).toBe("₹1.3 – 1.46 Cr");
    expect(formatINRRange(6000000, 9000000)).toBe("₹60 – 90 L");
  });

  it("keeps both units when they differ", () => {
    expect(formatINRRange(9000000, 12000000)).toBe("₹90 L – ₹1.2 Cr");
  });

  it("collapses equal or one-sided ranges to a single price", () => {
    expect(formatINRRange(9000000, 9000000)).toBe("₹90 L");
    expect(formatINRRange(9000000, null)).toBe("₹90 L");
    expect(formatINRRange(null, "12000000.00")).toBe("₹1.2 Cr");
  });

  it("orders reversed input", () => {
    expect(formatINRRange(14600000, 13000000)).toBe("₹1.3 – 1.46 Cr");
  });

  it("falls back to price on request", () => {
    expect(formatINRRange(null, null)).toBe("Price on request");
    expect(formatINRRange(0, 0)).toBe("Price on request");
  });
});
