import { describe, expect, it } from "vitest";
import { amortizationSchedule, emi, loanTotals } from "./emi";

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
});
