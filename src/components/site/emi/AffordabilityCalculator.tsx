"use client";

import { useMemo, useState } from "react";
import { affordableHome } from "@/lib/emi";
import { SliderRow } from "./slider-row";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/**
 * Embeddable affordability block: income and obligations in, the home
 * value that income supports out. FOIR is fixed at 50% (bank norm).
 */
export function AffordabilityCalculator() {
  const [income, setIncome] = useState(100000);
  const [obligations, setObligations] = useState(0);
  const [ratePct, setRatePct] = useState(7.25);
  const [years, setYears] = useState(20);
  const [downPaymentPct, setDownPaymentPct] = useState(20);

  const { emiCapacity, maxLoan, maxHomeValue } = useMemo(
    () =>
      affordableHome({
        monthlyIncome: income,
        monthlyObligations: obligations,
        annualRatePct: ratePct,
        years,
        downPaymentPct,
      }),
    [income, obligations, ratePct, years, downPaymentPct],
  );

  const loanShare = maxHomeValue > 0 ? maxLoan / maxHomeValue : 0;
  const donutR = 50;
  const donutSw = 18;
  const donutC = 2 * Math.PI * donutR;

  return (
    <div className="grid! gap-8! lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]!">
      <div className="flex! flex-col! justify-center! gap-7!">
        <SliderRow label="Gross monthly income" display={inr(income)} minLabel="₹20K" maxLabel="₹5L" min={20000} max={500000} step={5000} value={income} onChange={setIncome} />
        <SliderRow label="Existing monthly EMIs" display={inr(obligations)} minLabel="₹0" maxLabel="₹2L" min={0} max={200000} step={1000} value={obligations} onChange={setObligations} />
        <SliderRow label="Interest rate" display={`${ratePct.toFixed(2)}% p.a.`} minLabel="7%" maxLabel="15%" min={7} max={15} step={0.05} value={ratePct} onChange={setRatePct} />
        <SliderRow label="Tenure" display={`${years} year${years === 1 ? "" : "s"}`} minLabel="1 yr" maxLabel="30 yrs" min={1} max={30} step={1} value={years} onChange={setYears} />
        <SliderRow label="Down payment" display={`${downPaymentPct}%`} minLabel="0%" maxLabel="50%" min={0} max={50} step={5} value={downPaymentPct} onChange={setDownPaymentPct} />
        <p className="text-[13px]! leading-relaxed! text-gray-500!">
          Banks allow EMIs up to about 50% of income — capacity here is half
          your income minus existing EMIs. Your actual eligibility depends on
          credit score and the lender&apos;s assessment.
        </p>
      </div>

      <div className="flex! flex-col! items-center! gap-5! rounded-2xl! bg-gray-50! px-6! py-6!">
        <div className="relative! h-56! w-56!" role="img" aria-label={`Affordable home value ${inr(maxHomeValue)}`}>
          <svg viewBox="0 0 120 120" className="h-full! w-full! -rotate-90! drop-shadow-[0_6px_16px_rgba(39,66,127,0.18)]!">
            <circle cx="60" cy="60" r={donutR} fill="none" strokeWidth={donutSw} className="stroke-gray-200!" />
            <circle
              cx="60"
              cy="60"
              r={donutR}
              fill="none"
              strokeWidth={donutSw}
              className="stroke-[#27427f]!"
              strokeDasharray={`${donutC * loanShare} ${donutC}`}
            />
            <circle
              cx="60"
              cy="60"
              r={donutR}
              fill="none"
              strokeWidth={donutSw}
              className="stroke-amber-400!"
              strokeDasharray={`${donutC * (1 - loanShare)} ${donutC}`}
              strokeDashoffset={-donutC * loanShare}
            />
          </svg>
          <div className="absolute! inset-0! flex! flex-col! items-center! justify-center! px-8! text-center!">
            <span className="text-xs! text-gray-500!">You can afford</span>
            <span className="whitespace-nowrap! text-xl! leading-tight! font-semibold! text-gray-900! tabular-nums!">{inr(maxHomeValue)}</span>
          </div>
        </div>
        <dl className="w-full! space-y-0! text-sm!">
          <div className="flex! justify-between! gap-4! border-b! border-gray-200! py-2.5!">
            <dt className="flex! items-center! gap-2! font-medium! text-gray-600!"><span className="h-2.5! w-2.5! rounded-full! bg-[#27427f]!" />Max loan</dt>
            <dd className="font-semibold! whitespace-nowrap! text-gray-900! tabular-nums!">{inr(maxLoan)}</dd>
          </div>
          <div className="flex! justify-between! gap-4! border-b! border-gray-200! py-2.5!">
            <dt className="flex! items-center! gap-2! font-medium! text-gray-600!"><span className="h-2.5! w-2.5! rounded-full! bg-amber-400!" />Down payment</dt>
            <dd className="font-semibold! whitespace-nowrap! text-gray-900! tabular-nums!">{inr(maxHomeValue - maxLoan)}</dd>
          </div>
          <div className="flex! justify-between! gap-4! py-2.5!">
            <dt className="font-medium! text-gray-600!">EMI at capacity</dt>
            <dd className="font-semibold! whitespace-nowrap! text-gray-900! tabular-nums!">{inr(emiCapacity)}/mo</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
