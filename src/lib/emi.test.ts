import { describe, expect, it } from "vitest";
import { affordableHome, amortizationSchedule, emi, loanTotals, maxLoanForEmi } from "./emi";

describe("emi math", () => {
  it("matches the published vector: 50L @ 7% x 20y = Rs.38,765/mo", () => {
    expect(Math.round(emi(5_000_000, 7, 20))).toBe(38765);
  });

  it("returns 0 for nonsense input and splits evenly at zero rate", () => {
    expect(emi(0, 7, 20)).toBe(0);
    expect(emi(5_000_000, 7, 0)).toBe(0);
    expect(emi(1_200_000, 0, 1)).toBe(100000);
  });

  it("schedule principal sums back to the loan and ends at zero", () => {
    const rows = amortizationSchedule(5_000_000, 7, 20);
    const principalSum = rows.reduce((sum, row) => sum + row.principal, 0);
    expect(principalSum).toBeCloseTo(5_000_000, 0);
    expect(rows[rows.length - 1]!.balance).toBe(0);
    expect(rows).toHaveLength(20);
  });

  it("totals agree with emi x months", () => {
    const { monthlyEmi, totalInterest, totalPayable } = loanTotals(5_000_000, 7, 20);
    expect(totalPayable).toBeCloseTo(monthlyEmi * 240, 0);
    expect(totalInterest).toBeCloseTo(totalPayable - 5_000_000, 0);
  });

  it("maxLoanForEmi inverts emi", () => {
    expect(maxLoanForEmi(emi(5_000_000, 7, 20), 7, 20)).toBeCloseTo(5_000_000, 0);
    expect(maxLoanForEmi(100000, 0, 1)).toBe(1200000);
    expect(maxLoanForEmi(0, 7, 20)).toBe(0);
  });

  it("affordability floors at zero when obligations eat the capacity", () => {
    const full = affordableHome({
      monthlyIncome: 100000,
      monthlyObligations: 0,
      annualRatePct: 7.25,
      years: 20,
      downPaymentPct: 20,
    });
    expect(full.maxLoan).toBeGreaterThan(0);
    expect(full.maxHomeValue).toBeCloseTo(full.maxLoan / 0.8, 0);
    const none = affordableHome({
      monthlyIncome: 100000,
      monthlyObligations: 60000,
      annualRatePct: 7.25,
      years: 20,
      downPaymentPct: 20,
    });
    expect(none).toEqual({ emiCapacity: 0, maxLoan: 0, maxHomeValue: 0 });
  });
});
