import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";
import { loanTotals } from "@/lib/emi";

/** Illustrative inputs, matching the existing calculator defaults, not a lender quote. */
export const PROJECT_FINANCE_ASSUMPTIONS = {
  annualRatePct: 7.25,
  years: 20,
  downPaymentPct: 20,
  emiIncomeShare: 0.5,
} as const;

export type ProjectFinanceEstimate = {
  unit: ProjectUnit;
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  monthlyEmi: number;
  monthlyIncome: number;
  totalInterest: number;
  totalPayable: number;
};

export function projectFinanceUnits(project: Pick<ProjectDetail, "units">): ProjectUnit[] {
  return (project.units ?? []).filter((unit) => {
    const mode = unit.listingMode?.toLowerCase();
    const price = Number(unit.price);
    return unit.status?.toLowerCase() === "available" &&
      (!mode || mode === "sale" || mode === "both") &&
      Number.isFinite(price) && price > 0;
  }).sort((a, b) => Number(a.price) - Number(b.price));
}

export type ProjectFinanceOptions = {
  unitId?: number;
  annualRatePct?: number;
  years?: number;
  /** Share of the price paid upfront, 0–100. Defaults to the 20% assumption. */
  downPaymentPct?: number;
};

export function projectFinanceEstimate(project: Pick<ProjectDetail, "units">, options: ProjectFinanceOptions = {}): ProjectFinanceEstimate | null {
  const candidates = projectFinanceUnits(project);
  const unit = candidates.find((candidate) => candidate.id === options.unitId) ?? candidates[0];
  if (!unit) return null;

  const propertyPrice = Number(unit.price);
  const downPaymentPct = Number.isFinite(options.downPaymentPct) && Number(options.downPaymentPct) >= 0 && Number(options.downPaymentPct) <= 100
    ? Number(options.downPaymentPct) : PROJECT_FINANCE_ASSUMPTIONS.downPaymentPct;
  const downPayment = propertyPrice * downPaymentPct / 100;
  const loanAmount = propertyPrice - downPayment;
  const annualRatePct = Number.isFinite(options.annualRatePct) && Number(options.annualRatePct) >= 0
    ? Number(options.annualRatePct) : PROJECT_FINANCE_ASSUMPTIONS.annualRatePct;
  const years = Number.isFinite(options.years) && Number(options.years) > 0
    ? Number(options.years) : PROJECT_FINANCE_ASSUMPTIONS.years;
  const { monthlyEmi, totalInterest, totalPayable } = loanTotals(loanAmount, annualRatePct, years);
  return {
    unit, propertyPrice, downPayment, loanAmount, monthlyEmi, totalInterest, totalPayable,
    // Existing calculator's income model, with no other monthly obligations.
    monthlyIncome: monthlyEmi / PROJECT_FINANCE_ASSUMPTIONS.emiIncomeShare,
  };
}
