import Link from "next/link";
import { formatINR, type ProjectDetail } from "@/lib/api/projects";
import { projectFinanceEstimate, PROJECT_FINANCE_ASSUMPTIONS } from "@/lib/project-finance";
import { unitAreaLabel } from "@/lib/project-config-summary";
import { Card, TEXT_LINK } from "@/components/site/project/project-ui";

const money = (amount: number) =>
  `₹${Math.round(amount).toLocaleString("en-IN")}`;

function configurationLabel(unit: NonNullable<ReturnType<typeof projectFinanceEstimate>>["unit"]) {
  if (unit.bedrooms != null && unit.bedrooms > 0) return `${unit.bedrooms} BHK`;
  const type = unit.unitType.replace(/[_-]+/g, " ").trim();
  return type ? type.replace(/\b\w/g, (letter) => letter.toUpperCase()) : unit.title;
}

/** A compact estimate based on the project's cheapest priced available unit. */
export function CalculatorsSection({ project }: { project: ProjectDetail }) {
  const estimate = projectFinanceEstimate(project);

  return (
    <Card title="Plan your finances" id="calculators">
      {!estimate ? (
        <div className="mt-6! rounded-xl! bg-gray-50! p-4! text-sm! text-gray-600!">
          <p className="font-semibold! text-gray-900!">Price on request</p>
          <p className="mt-1!">A finance estimate will appear when an available unit price is shared.</p>
        </div>
      ) : (
        <>
          <div className="mt-6! rounded-xl! bg-gray-50! p-4! sm:p-6!">
            <p className="text-sm! text-gray-600!">
              From {formatINR(estimate.propertyPrice)} · {configurationLabel(estimate.unit)}
              {unitAreaLabel(estimate.unit, project.projectType)
                ? ` · ${unitAreaLabel(estimate.unit, project.projectType)}`
                : ""}
            </p>
            <div className="mt-4! grid! grid-cols-1! gap-4! sm:grid-cols-2!">
              <Metric label="Estimated monthly EMI" value={money(estimate.monthlyEmi)} />
              <Metric label="Indicative monthly income" value={money(estimate.monthlyIncome)} />
            </div>
            <p className="mt-4! text-sm! text-gray-600!">
              {formatINR(estimate.downPayment)} down payment · {formatINR(estimate.loanAmount)} loan
            </p>
            <p className="mt-4! text-xs! leading-5! text-gray-500!">
              Illustration: {PROJECT_FINANCE_ASSUMPTIONS.downPaymentPct}% down, {PROJECT_FINANCE_ASSUMPTIONS.years} years at {PROJECT_FINANCE_ASSUMPTIONS.annualRatePct}%. Income assumes no existing EMIs and payments at 50% of income.
            </p>
          </div>
        </>
      )}
      <div className="mt-4! flex! flex-wrap! gap-x-6! gap-y-2!">
        <Link href="/emi-calculator" className={`text-sm! font-semibold! ${TEXT_LINK}`}>
          Customize with EMI calculator
        </Link>
        <Link href="/affordability-calculator" className={`text-sm! font-semibold! ${TEXT_LINK}`}>
          Customize with affordability calculator
        </Link>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs! font-medium! text-gray-500!">{label}</p>
      <p className="mt-1! text-xl! font-semibold! tabular-nums! text-[#27427f]!">{value}</p>
    </div>
  );
}
