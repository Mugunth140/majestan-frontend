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
