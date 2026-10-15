"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatINR } from "@/lib/api/projects";
import styles from "@/components/site/project/overview/project-finance.module.css";

export const financeMoney = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

export function FinanceSection({ children, emptyMessage }: { children?: ReactNode; emptyMessage?: string }) {
  const headingId = useId();
  return (
    <section id="calculators" aria-labelledby={headingId} className={`font-manrope-page ${styles.section}`}>
      <h2 id={headingId} className={styles.title}>Plan your EMI</h2>
      {children || <div className={styles.empty}><strong>Price on request</strong><p>{emptyMessage}</p></div>}
      <nav className={styles.links} aria-label="Home finance tools">
        <Link href="/emi-calculator">Full EMI calculator <ArrowUpRight size={20} aria-hidden="true" /></Link>
        <Link href="/affordability-calculator">Check affordability <ArrowUpRight size={20} aria-hidden="true" /></Link>
      </nav>
    </section>
  );
}

type FinanceEstimate = {
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
};

/** The same controls, calculations display and repayment breakdown on both listing types. */
export function FinanceBreakdown({ estimate, rate, years, loanPct, onRateChange, onYearsChange, onLoanPctChange, priceLabel = "home" }: {
  estimate: FinanceEstimate;
  rate: number;
  years: number;
  loanPct: number;
  onRateChange: (value: number) => void;
  onYearsChange: (value: number) => void;
  onLoanPctChange: (value: number) => void;
  priceLabel?: string;
}) {
  const principalShare = estimate.loanAmount / estimate.totalPayable * 100;
  return (
    <>
      <div className={styles.main}>
        <div className={styles.payment}>
          <span className={styles.label}>Estimated monthly EMI</span>
          <output aria-label="Estimated monthly EMI" aria-live="polite" className={styles.emi}>{financeMoney(estimate.monthlyEmi)}</output>
          <p className={styles.selectedPrice}>{formatINR(estimate.propertyPrice)} {priceLabel} · {formatINR(estimate.downPayment)} down</p>
        </div>
        <div className={styles.controls}>
          <FinanceSlider label="Loan amount" min={10} max={90} step={5} value={loanPct}
            display={`${formatINR(estimate.loanAmount)} · ${loanPct}%`} onChange={onLoanPctChange} />
          <FinanceSlider label="Interest rate" min={5} max={15} step={0.25} value={rate} display={`${rate.toFixed(2)}% p.a.`} onChange={onRateChange} />
          <FinanceSlider label="Loan tenure" min={5} max={30} step={1} value={years} display={`${years} years`} onChange={onYearsChange} />
        </div>
      </div>

      <div className={styles.breakdown}>
        <div className={styles.repaymentBar} role="img" aria-label={`Repayment split: loan ${financeMoney(estimate.loanAmount)}, interest ${financeMoney(estimate.totalInterest)}`}>
          <span className={styles.principal} style={{ width: `${principalShare}%` }} />
          <span className={styles.interest} style={{ width: `${100 - principalShare}%` }} />
        </div>
        <dl className={styles.repaymentNumbers}>
          <div><dt><span className={styles.loanDot} />Loan amount</dt><dd>{formatINR(estimate.loanAmount)}</dd></div>
          <div><dt><span className={styles.interestDot} />Interest over {years} years</dt><dd>{formatINR(estimate.totalInterest)}</dd></div>
        </dl>
      </div>

      <details className={styles.assumptions}>
        <summary>{100 - loanPct}% down payment · View assumptions</summary>
        <p>Illustrative estimate: {formatINR(estimate.loanAmount)} borrowed at {rate.toFixed(2)}% over {years} years. Lender terms and purchase costs may differ.</p>
      </details>
    </>
  );
}

function FinanceSlider({ label, min, max, step, value, display, onChange }: {
  label: string; min: number; max: number; step: number; value: number; display: string; onChange: (value: number) => void;
}) {
  const id = useId();
  const fill = (value - min) / (max - min) * 100;
  return (
    <div className={styles.slider}>
      <div className={styles.sliderLabel}><label htmlFor={id}>{label}</label><output htmlFor={id}>{display}</output></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--finance-fill": `${fill}%` } as CSSProperties} />
    </div>
  );
}
