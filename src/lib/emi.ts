/**
 * Home-loan EMI math (reducing balance, monthly rests).
 * Pure functions — no formatting, no React. Indian formatting happens
 * at the render layer with `en-IN` like the rest of the site.
 */

export type AmortizationYear = {
  year: number;
  principal: number;
  interest: number;
  balance: number;
};

export function monthlyRate(annualRatePct: number): number {
  return annualRatePct / 1200;
}

/** Standard EMI formula. Returns 0 for nonsense input instead of NaN. */
export function emi(principal: number, annualRatePct: number, years: number): number {
  const months = Math.round(years * 12);
  if (!(principal > 0) || !(months > 0)) return 0;
  if (!(annualRatePct > 0)) return principal / months;
  const r = monthlyRate(annualRatePct);
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

/** Year-wise split of every payment into principal + interest. */
export function amortizationSchedule(
  principal: number,
  annualRatePct: number,
  years: number,
): AmortizationYear[] {
  const months = Math.round(years * 12);
  const payment = emi(principal, annualRatePct, years);
  if (payment <= 0) return [];
  const r = monthlyRate(annualRatePct);
  let balance = principal;
  const rows: AmortizationYear[] = [];
  for (let year = 1; year <= years; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12 && balance > 0.005; m++) {
      const interest = balance * r;
      const principalPart = Math.min(payment - interest, balance);
      yearInterest += interest;
      yearPrincipal += principalPart;
      balance -= principalPart;
    }
    rows.push({ year, principal: yearPrincipal, interest: yearInterest, balance: Math.max(balance, 0) });
    if (balance <= 0.005) {
      // Snap float dust to a clean zero on the final row.
      rows[rows.length - 1]!.balance = 0;
      break;
    }
  }
  return rows;
}

export function loanTotals(principal: number, annualRatePct: number, years: number): {
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
} {
  const monthlyEmi = emi(principal, annualRatePct, years);
  const months = Math.round(years * 12);
  const totalPayable = monthlyEmi * months;
  return { monthlyEmi, totalInterest: Math.max(totalPayable - principal, 0), totalPayable };
}

/** Inverse EMI formula: biggest principal a given monthly payment supports. */
export function maxLoanForEmi(emiAmount: number, annualRatePct: number, years: number): number {
  const months = Math.round(years * 12);
  if (!(emiAmount > 0) || !(months > 0)) return 0;
  if (!(annualRatePct > 0)) return emiAmount * months;
  const r = monthlyRate(annualRatePct);
  const growth = Math.pow(1 + r, months);
  return (emiAmount * (growth - 1)) / (r * growth);
}

/**
 * What home value an income supports. Banks cap total EMIs around FOIR
 * (50%) of income; the home value backs out the down payment.
 */
export function affordableHome({
  monthlyIncome,
  monthlyObligations,
  annualRatePct,
  years,
  downPaymentPct,
}: {
  monthlyIncome: number;
  monthlyObligations: number;
  annualRatePct: number;
  years: number;
  downPaymentPct: number;
}): { emiCapacity: number; maxLoan: number; maxHomeValue: number } {
  const emiCapacity = Math.max(monthlyIncome * 0.5 - Math.max(monthlyObligations, 0), 0);
  const maxLoan = maxLoanForEmi(emiCapacity, annualRatePct, years);
  const downPaymentFraction = Math.min(Math.max(downPaymentPct, 0), 90) / 100;
  const maxHomeValue = downPaymentFraction >= 1 ? 0 : maxLoan / (1 - downPaymentFraction);
  return { emiCapacity, maxLoan, maxHomeValue };
}
