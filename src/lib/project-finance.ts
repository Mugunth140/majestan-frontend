import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";
import { emi } from "@/lib/emi";

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
};

export function projectFinanceEstimate(project: Pick<ProjectDetail, "units">): ProjectFinanceEstimate | null {
  const candidates = (project.units ?? []).filter((unit) => {
    const mode = unit.listingMode?.toLowerCase();
    const price = Number(unit.price);
    return unit.status?.toLowerCase() === "available" &&
      (!mode || mode === "sale" || mode === "both") &&
      Number.isFinite(price) && price > 0;
  });
  const unit = candidates.reduce<ProjectUnit | null>((lowest, current) =>
    !lowest || Number(current.price) < Number(lowest.price) ? current : lowest, null);
  if (!unit) return null;

  const propertyPrice = Number(unit.price);
  const downPayment = propertyPrice * PROJECT_FINANCE_ASSUMPTIONS.downPaymentPct / 100;
  const loanAmount = propertyPrice - downPayment;
  const monthlyEmi = emi(loanAmount, PROJECT_FINANCE_ASSUMPTIONS.annualRatePct, PROJECT_FINANCE_ASSUMPTIONS.years);
  return {
    unit, propertyPrice, downPayment, loanAmount, monthlyEmi,
    // Existing calculator's income model, with no other monthly obligations.
    monthlyIncome: monthlyEmi / PROJECT_FINANCE_ASSUMPTIONS.emiIncomeShare,
  };
}
