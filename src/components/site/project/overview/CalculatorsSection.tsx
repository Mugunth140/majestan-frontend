"use client";

import { useId, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { formatINR, type ProjectDetail, type ProjectUnit } from "@/lib/api/projects";
import { projectFinanceEstimate, projectFinanceUnits, PROJECT_FINANCE_ASSUMPTIONS } from "@/lib/project-finance";
import { unitAreaLabel } from "@/lib/project-config-summary";
import styles from "./project-finance.module.css";

const money = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

function unitTypeLabel(unit: ProjectUnit): string {
  const bedrooms = unit.bedrooms || Number(unit.unitType?.match(/^(\d+)bhk$/i)?.[1]);
  if (bedrooms > 0) return `${bedrooms} BHK`;
  return unit.unitType?.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Home";
}

export function CalculatorsSection({ project }: { project: ProjectDetail }) {
  return (
    <section id="calculators" aria-labelledby="project-finance-title" className={`font-manrope-page ${styles.section}`}>
      <h2 id="project-finance-title" className={styles.title}>Your home. Your EMI.</h2>
      {projectFinanceUnits(project).length ? (
        <FinanceWidget key={project.id} project={project} />
      ) : (
        <div className={styles.empty}>
          <strong>Price on request</strong>
          <p>Estimates will appear when available homes are priced.</p>
        </div>
      )}
      <nav className={styles.links} aria-label="Home finance tools">
        <Link href="/emi-calculator">Full EMI calculator <ArrowUpRight size={20} aria-hidden="true" /></Link>
        <Link href="/affordability-calculator">Check affordability <ArrowUpRight size={20} aria-hidden="true" /></Link>
      </nav>
    </section>
  );
}

function FinanceWidget({ project }: { project: ProjectDetail }) {
  const units = projectFinanceUnits(project);
  const [unitId, setUnitId] = useState(units[0]?.id);
  const [rate, setRate] = useState<number>(PROJECT_FINANCE_ASSUMPTIONS.annualRatePct);
  const [years, setYears] = useState<number>(PROJECT_FINANCE_ASSUMPTIONS.years);
  const configurationGroupId = useId();
  const estimate = projectFinanceEstimate(project, { unitId, annualRatePct: rate, years });
  if (!estimate) return null;

  const groups = new Map<string, ProjectUnit[]>();
  for (const unit of units) {
    const name = unitTypeLabel(unit);
    groups.set(name, [...(groups.get(name) ?? []), unit]);
  }
  const selectedType = unitTypeLabel(estimate.unit);
  const configurations = groups.get(selectedType) ?? [];
  const principalShare = estimate.loanAmount / estimate.totalPayable * 100;

  return (
    <div className={styles.widget}>
      <div className={styles.picker}>
        <p className={styles.label}>Choose your unit</p>
        <div className={styles.unitTypes} role="group" aria-label="Unit types">
          {[...groups].map(([name, group]) => {
            const starting = projectFinanceEstimate(project, { unitId: group[0].id, annualRatePct: rate, years })!;
            return (
              <button key={name} type="button" className={`${styles.unitButton} ${selectedType === name ? styles.selected : ""}`}
                aria-pressed={selectedType === name} onClick={() => setUnitId(group[0].id)}>
                <strong>{name}</strong>
                <span>From {money(starting.monthlyEmi)}/mo</span>
              </button>
            );
          })}
        </div>
      </div>

      <fieldset className={styles.configurations}>
        <legend className={styles.label}>Pick a configuration</legend>
        <div className={styles.configurationChoices}>
          {configurations.map((unit) => {
            const area = unitAreaLabel(unit, project.projectType);
            const name = area || unit.title || unit.unitCode;
            const duplicate = configurations.some((other) => other.id !== unit.id && unitAreaLabel(other, project.projectType) === area);
            return (
              <label key={unit.id} className={`${styles.configuration} ${estimate.unit.id === unit.id ? styles.activeConfiguration : ""}`}>
                <input type="radio" name={configurationGroupId} value={unit.id} checked={estimate.unit.id === unit.id}
                  onChange={() => setUnitId(unit.id)} aria-label={`${selectedType}, ${name}${duplicate ? `, ${unit.title || unit.unitCode}` : ""}, ${formatINR(Number(unit.price))}`} />
                <span className={styles.configurationName}>{name}{duplicate && <span>{unit.title || unit.unitCode}</span>}</span>
                <span className={styles.configurationPrice}>{formatINR(Number(unit.price))}{estimate.unit.id === unit.id && <Check size={18} aria-hidden="true" />}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className={styles.main}>
        <div className={styles.payment}>
          <span className={styles.label}>Estimated monthly EMI</span>
          <output aria-label="Estimated monthly EMI" aria-live="polite" className={styles.emi}>{money(estimate.monthlyEmi)}</output>
          <p className={styles.selectedPrice}>{formatINR(estimate.propertyPrice)} home · {formatINR(estimate.downPayment)} down</p>
        </div>
        <div className={styles.controls}>
          <FinanceSlider label="Interest rate" min={5} max={15} step={0.25} value={rate} display={`${rate.toFixed(2)}% p.a.`} onChange={setRate} />
          <FinanceSlider label="Loan tenure" min={5} max={30} step={1} value={years} display={`${years} years`} onChange={setYears} />
        </div>
      </div>

      <div className={styles.breakdown}>
        <div className={styles.repaymentBar} role="img" aria-label={`Repayment split: loan ${money(estimate.loanAmount)}, interest ${money(estimate.totalInterest)}`}>
          <span className={styles.principal} style={{ width: `${principalShare}%` }} />
          <span className={styles.interest} style={{ width: `${100 - principalShare}%` }} />
        </div>
        <dl className={styles.repaymentNumbers}>
          <div><dt><span className={styles.loanDot} />Loan amount</dt><dd>{formatINR(estimate.loanAmount)}</dd></div>
          <div><dt><span className={styles.interestDot} />Interest over {years} years</dt><dd>{formatINR(estimate.totalInterest)}</dd></div>
          <div><dt>Indicative monthly income</dt><dd>{money(estimate.monthlyIncome)}</dd></div>
        </dl>
      </div>

      <details className={styles.assumptions}>
        <summary>{PROJECT_FINANCE_ASSUMPTIONS.downPaymentPct}% down payment · View assumptions</summary>
        <p>Illustrative estimate at {rate.toFixed(2)}% over {years} years. Income assumes no existing EMIs and payments at 50% of income. Lender terms and purchase costs may differ.</p>
      </details>
    </div>
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
