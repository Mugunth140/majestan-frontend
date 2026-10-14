"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { formatINR, type ProjectDetail } from "@/lib/api/projects";
import { projectFinanceEstimate, projectFinanceUnits, PROJECT_FINANCE_ASSUMPTIONS } from "@/lib/project-finance";
import { unitAreaLabel } from "@/lib/project-config-summary";
import { Card, TEXT_LINK } from "@/components/site/project/project-ui";

const money = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;
const compactMoney = formatINR;

function configurationLabel(unit: NonNullable<ReturnType<typeof projectFinanceEstimate>>["unit"]) {
  if (unit.bedrooms != null && unit.bedrooms > 0) return `${unit.bedrooms} BHK`;
  const type = unit.unitType.replace(/[_-]+/g, " ").trim();
  return type ? type.replace(/\b\w/g, (letter) => letter.toUpperCase()) : unit.title;
}

/** A small, interactive illustration using the project's priced available units. */
export function CalculatorsSection({ project }: { project: ProjectDetail }) {
  const units = projectFinanceUnits(project);
  return (
    <Card title="Plan your finances" id="calculators">
      {units.length === 0 ? (
        <div className="mt-6! rounded-2xl! bg-gray-50! p-5! text-sm! text-gray-600!">
          <p className="font-semibold! text-gray-900!">Price on request</p>
          <p className="mt-1!">An estimate will appear when an available unit price is shared.</p>
        </div>
      ) : (
        <FinanceWidget key={project.id} project={project} />
      )}
      <div className="mt-4! flex! flex-wrap! gap-x-6! gap-y-2!">
        <Link href="/emi-calculator" className={`text-sm! font-semibold! ${TEXT_LINK}`}>Open EMI calculator</Link>
        <Link href="/affordability-calculator" className={`text-sm! font-semibold! ${TEXT_LINK}`}>Open affordability calculator</Link>
      </div>
    </Card>
  );
}

function FinanceWidget({ project }: { project: ProjectDetail }) {
  const unitControlId = useId();
  const units = projectFinanceUnits(project);
  const [unitId, setUnitId] = useState<number | undefined>(units[0]?.id);
  const [annualRatePct, setAnnualRatePct] = useState<number>(PROJECT_FINANCE_ASSUMPTIONS.annualRatePct);
  const [years, setYears] = useState<number>(PROJECT_FINANCE_ASSUMPTIONS.years);
  const estimate = projectFinanceEstimate(project, { unitId, annualRatePct, years });
  if (!estimate) return null;

  return (
    <div className="mt-6! overflow-hidden! rounded-2xl! border! border-[#dce4f3]! bg-[#f7f9fe]!">
      <div className="grid! gap-5! p-4! sm:p-6! lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.85fr)]! lg:gap-8!">
        <div className="min-w-0!">
          <label htmlFor={unitControlId} className="text-xs! font-semibold! uppercase! tracking-wide! text-gray-500!">Choose a home</label>
          <select id={unitControlId} value={estimate.unit.id} onChange={(event) => setUnitId(Number(event.target.value))}
            className="mt-2! w-full! rounded-xl! border! border-gray-200! bg-white! px-3! py-2.5! text-sm! font-medium! text-gray-900! shadow-sm! outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!">
            {units.map((unit) => <option key={unit.id} value={unit.id}>{configurationLabel(unit)}{unitAreaLabel(unit, project.projectType) ? ` · ${unitAreaLabel(unit, project.projectType)}` : ""} · {compactMoney(Number(unit.price))}</option>)}
          </select>
          <div className="mt-4! flex! flex-wrap! items-center! justify-between! gap-2!">
            <span className="text-sm! text-gray-600!">Home price</span>
            <span className="shrink-0! text-sm! font-semibold! text-gray-900!">{compactMoney(estimate.propertyPrice)}</span>
          </div>
          <span className="mt-2! inline-flex! rounded-full! bg-[#edf2fc]! px-2.5! py-1! text-xs! font-medium! text-[#27427f]!">{compactMoney(estimate.downPayment)} down payment</span>

          <div className="mt-6! space-y-5!">
            <Slider label="Interest rate" value={annualRatePct} min={5} max={12} step={0.25} display={`${annualRatePct.toFixed(2)}%`} onChange={setAnnualRatePct} />
            <Slider label="Loan tenure" value={years} min={5} max={30} step={1} display={`${years} years`} onChange={setYears} />
          </div>
          <p className="mt-5! text-xs! leading-5! text-gray-500!">Illustration at {PROJECT_FINANCE_ASSUMPTIONS.downPaymentPct}% down payment. Actual lender terms may vary.</p>
        </div>

        <div className="flex! min-w-0! flex-col! items-center! justify-center! rounded-xl! bg-white/80! p-4! ring-1! ring-[#e5eaf4]! sm:flex-row! sm:gap-5! lg:flex-col!">
          <div className="relative! h-44! w-44! shrink-0!" aria-label={`Monthly EMI ${money(estimate.monthlyEmi)}, loan principal ${money(estimate.loanAmount)}, total interest ${money(estimate.totalInterest)}`} role="img">
            <svg viewBox="0 0 120 120" className="h-full! w-full! -rotate-90!" aria-hidden="true">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#7895d4" strokeWidth="14" />
              <circle cx="60" cy="60" r="48" fill="none" stroke="#27427f" strokeWidth="14" strokeDasharray={`${2 * Math.PI * 48 * (estimate.loanAmount / estimate.totalPayable)} ${2 * Math.PI * 48 * (estimate.totalInterest / estimate.totalPayable)}`} strokeLinecap="butt" />
            </svg>
            <div className="absolute! inset-0! flex! flex-col! items-center! justify-center! text-center!">
              <span className="text-xs! font-medium! text-gray-500!">Monthly EMI</span>
              <strong className="mt-1! text-2xl! font-semibold! tracking-tight! tabular-nums! text-[#27427f]!">{money(estimate.monthlyEmi)}</strong>
              <span className="text-xs! text-gray-500!">per month</span>
            </div>
          </div>
          <div className="grid! w-full! grid-cols-2! gap-3! sm:grid-cols-1! sm:max-w-40! lg:grid-cols-2! lg:max-w-none!">
            <Amount label="Loan principal" value={compactMoney(estimate.loanAmount)} color="bg-[#27427f]" />
            <Amount label="Total interest" value={compactMoney(estimate.totalInterest)} color="bg-[#7895d4]" />
          </div>
          <div className="mt-3! w-full! border-t! border-gray-100! pt-3! text-center! sm:mt-0! sm:border-0! sm:pt-0! lg:border-t! lg:pt-3!">
            <span className="text-xs! text-gray-500!">Indicative monthly income</span>
            <div className="mt-0.5! text-base! font-semibold! tabular-nums! text-gray-900!">{money(estimate.monthlyIncome)}</div>
            <span className="text-xs! text-gray-500!">No existing EMIs · 50% towards payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex! items-center! justify-between! gap-3!">
        <label htmlFor={id} className="text-sm! font-medium! text-gray-700!">{label}</label>
        <output htmlFor={id} className="text-sm! font-semibold! tabular-nums! text-[#27427f]!">{display}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2! h-2! w-full! cursor-pointer! accent-[#27427f]! focus-visible:outline-2! focus-visible:outline-[#27427f]! focus-visible:outline-offset-4!" />
      <div className="mt-1! flex! justify-between! text-xs! text-gray-500!" aria-hidden="true"><span>{min}{label === "Interest rate" ? "%" : " yrs"}</span><span>{max}{label === "Interest rate" ? "%" : " yrs"}</span></div>
    </div>
  );
}

function Amount({ label, value, color }: { label: string; value: string; color: string }) {
  return <div className="min-w-0!">
    <div className="flex! items-center! gap-2! text-xs! text-gray-500!"><span className={`h-2! w-2! shrink-0! rounded-full! ${color}!`} />{label}</div>
    <div className="mt-0.5! pl-3.5! text-sm! font-semibold! tabular-nums! text-gray-800!">{value}</div>
  </div>;
}
