import { describe, expect, it } from "vitest";
import { numberToIndianWords } from "./currency.util";

describe("numberToIndianWords", () => {
  it("keeps familiar Indian wording for whole rupee amounts", () => {
    expect(numberToIndianWords(1)).toBe("One Rupees");
    expect(numberToIndianWords(101)).toBe("One Hundred and One Rupees");
    expect(numberToIndianWords(1_00_00_000)).toBe("One Crore Rupees");
    expect(numberToIndianWords(5_00_000)).toBe("Five Lakh Rupees");
  });

  it("formats large crore values without exceeding the tens table", () => {
    expect(numberToIndianWords(99_99_99_999)).toBe(
      "Ninety Nine Crore Ninety Nine Lakh Ninety Nine Thousand Nine Hundred and Ninety Nine Rupees",
    );
    expect(numberToIndianWords(1_00_00_00_000)).toBe("One Hundred Crore Rupees");
    expect(numberToIndianWords(9_99_99_99_999)).toBe(
      "Nine Hundred and Ninety Nine Crore Ninety Nine Lakh Ninety Nine Thousand Nine Hundred and Ninety Nine Rupees",
    );
  });

  it("adds paise and rounds to the nearest paise", () => {
    expect(numberToIndianWords(500_000.5)).toBe("Five Lakh Rupees and Fifty Paise");
    expect(numberToIndianWords(1.01)).toBe("One Rupees and One Paise");
    expect(numberToIndianWords(1.999)).toBe("Two Rupees");
    expect(numberToIndianWords(0.5)).toBe("Fifty Paise");
  });

  it("returns an empty string for zero, negative, and non-finite values", () => {
    expect(numberToIndianWords(0)).toBe("");
    expect(numberToIndianWords(-1)).toBe("");
    expect(numberToIndianWords(Number.NaN)).toBe("");
    expect(numberToIndianWords(Number.POSITIVE_INFINITY)).toBe("");
  });
});
