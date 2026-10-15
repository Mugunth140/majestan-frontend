"use client";

import { useId, useState } from "react";
import { formatINR, type ProjectDetail, type ProjectUnit } from "@/lib/api/projects";
import { projectFinanceEstimate, projectFinanceUnits, PROJECT_FINANCE_ASSUMPTIONS } from "@/lib/project-finance";
import { unitAreaLabel } from "@/lib/project-config-summary";
import { FinanceSection, FinanceBreakdown } from "@/components/site/shared/FinanceCalculator";
import styles from "./project-finance.module.css";

const money = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

function unitTypeLabel(unit: ProjectUnit): string {
  const bedrooms = unit.bedrooms || Number(unit.unitType?.match(/^(\d+)bhk$/i)?.[1]);
  if (bedrooms > 0) return `${bedrooms} BHK`;
  return unit.unitType?.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Home";
}

export function CalculatorsSection({ project }: { project: ProjectDetail }) {
  return (
    <FinanceSection emptyMessage="Estimates will appear when available homes are priced.">
      {projectFinanceUnits(project).length > 0 ? <FinanceWidget key={project.id} project={project} /> : null}
    </FinanceSection>
  );
}

function FinanceWidget({ project }: { project: ProjectDetail }) {
  const units = projectFinanceUnits(project);
  const [unitId, setUnitId] = useState(units[0]?.id);
  const [rate, setRate] = useState<number>(PROJECT_FINANCE_ASSUMPTIONS.annualRatePct);
  const [years, setYears] = useState<number>(PROJECT_FINANCE_ASSUMPTIONS.years);
  // The loan as a share of the price; the rest is the down payment.
  const [loanPct, setLoanPct] = useState<number>(100 - PROJECT_FINANCE_ASSUMPTIONS.downPaymentPct);
  const configurationGroupId = useId();
  const estimate = projectFinanceEstimate(project, { unitId, annualRatePct: rate, years, downPaymentPct: 100 - loanPct });
  if (!estimate) return null;

  const groups = new Map<string, ProjectUnit[]>();
  for (const unit of units) {
    const name = unitTypeLabel(unit);
    groups.set(name, [...(groups.get(name) ?? []), unit]);
  }
  const selectedType = unitTypeLabel(estimate.unit);
  const configurations = groups.get(selectedType) ?? [];

  return (
    <div className={styles.widget}>
      <div className={styles.picker}>
        <p className={styles.label}>Choose your unit</p>
        <div className={styles.unitTypes} role="group" aria-label="Unit types">
          {[...groups].map(([name, group]) => {
            const starting = projectFinanceEstimate(project, { unitId: group[0].id, annualRatePct: rate, years, downPaymentPct: 100 - loanPct })!;
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
                <span className={styles.configurationPrice}>{formatINR(Number(unit.price))}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <FinanceBreakdown estimate={estimate} rate={rate} years={years} loanPct={loanPct}
        onRateChange={setRate} onYearsChange={setYears} onLoanPctChange={setLoanPct} />
    </div>
  );
}
