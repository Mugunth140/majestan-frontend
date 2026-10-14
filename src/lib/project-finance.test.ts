import { describe, expect, it } from "vitest";
import type { ProjectUnit } from "@/lib/api/projects";
import { affordableHome } from "@/lib/emi";
import { projectFinanceEstimate, projectFinanceUnits } from "./project-finance";

const unit = (id: number, price: string | null, status = "available", listingMode: string | null = "sale") => ({ id, price, status, listingMode }) as ProjectUnit;

describe("project finance estimate", () => {
  it("uses the cheapest available sale configuration, excluding booked and rental prices", () => {
    const result = projectFinanceEstimate({ units: [unit(1, "9000000"), unit(2, "6000000", "available", "both"), unit(3, "1000000", "booked"), unit(4, "10000", "available", "rent")] });
    expect(result).toMatchObject({ unit: { id: 2 }, propertyPrice: 6000000, downPayment: 1200000, loanAmount: 4800000 });
    // Income estimate should fund precisely this property in the full calculator.
    const budget = affordableHome({ monthlyIncome: result!.monthlyIncome, monthlyObligations: 0, annualRatePct: 7.25, years: 20, downPaymentPct: 20 });
    expect(budget.maxHomeValue).toBeCloseTo(6000000, 5);
    expect(budget.emiCapacity).toBeCloseTo(result!.monthlyEmi, 5);
  });

  it("does not fabricate an estimate for missing, invalid, unavailable, or rental-only prices", () => {
    expect(projectFinanceEstimate({ units: [] })).toBeNull();
    expect(projectFinanceEstimate({ units: [unit(1, null), unit(2, "0"), unit(3, "Infinity"), unit(4, "-50"), unit(5, "100", "sold"), unit(6, "100", "available", "rent")] })).toBeNull();
  });

  it("accepts legacy listing modes and leaves project unit order unchanged", () => {
    const units = [unit(1, "9000000"), unit(2, "5000000", "available", null)];
    expect(projectFinanceEstimate({ units })?.unit.id).toBe(2);
    expect(units.map((u) => u.id)).toEqual([1, 2]);
  });

  it("recalculates loan, EMI and interest for the selected configuration and slider inputs", () => {
    const project = { units: [unit(1, "5000000"), unit(2, "9000000"), unit(3, "2000000", "booked")] };
    expect(projectFinanceUnits(project).map((u) => u.id)).toEqual([1, 2]);
    const baseline = projectFinanceEstimate(project)!;
    const selected = projectFinanceEstimate(project, { unitId: 2 })!;
    expect(selected.loanAmount).toBe(7200000);
    expect(selected.monthlyEmi).toBeGreaterThan(baseline.monthlyEmi);
    const higherRate = projectFinanceEstimate(project, { unitId: 2, annualRatePct: 10 })!;
    expect(higherRate.monthlyEmi).toBeGreaterThan(selected.monthlyEmi);
    expect(higherRate.totalInterest).toBeGreaterThan(selected.totalInterest);
    const shorterTerm = projectFinanceEstimate(project, { unitId: 2, years: 10 })!;
    expect(shorterTerm.monthlyEmi).toBeGreaterThan(selected.monthlyEmi);
    expect(shorterTerm.totalInterest).toBeLessThan(selected.totalInterest);
    expect(selected.totalPayable).toBeCloseTo(selected.loanAmount + selected.totalInterest);
    expect(projectFinanceEstimate(project, { unitId: 3 })?.unit.id).toBe(1);
  });
});
