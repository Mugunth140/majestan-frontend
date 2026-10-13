"use client";

import { useMemo, useState } from "react";
import { amortizationSchedule, loanTotals } from "@/lib/emi";
import { SliderRow } from "./slider-row";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/**
 * Embeddable home-loan EMI block. Self-contained: three sliders in,
 * EMI + donut + totals + collapsible yearly schedule out. Defaults can
 * be seeded (e.g. a project price) without changing the component.
 */
export function EmiCalculator({
  initialPrincipal = 5000000,
  initialRatePct = 7.25,
  initialYears = 20,
}: {
  initialPrincipal?: number;
  initialRatePct?: number;
  initialYears?: number;
}) {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [ratePct, setRatePct] = useState(initialRatePct);
  const [years, setYears] = useState(initialYears);
  const [showSchedule, setShowSchedule] = useState(false);

  const { monthlyEmi, totalInterest, totalPayable } = useMemo(
    () => loanTotals(principal, ratePct, years),
    [principal, ratePct, years],
  );
  const schedule = useMemo(
    () => (showSchedule ? amortizationSchedule(principal, ratePct, years) : []),
    [showSchedule, principal, ratePct, years],
  );

  const interestShare = totalPayable > 0 ? totalInterest / totalPayable : 0;
  // Ring geometry must stay inside the 120 viewBox: r + strokeWidth/2 <= 60,
  // or the outer edge clips (the cropped look).
  const donutR = 50;
  const donutSw = 18;
  const donutC = 2 * Math.PI * donutR;

  return (
    <>
      {/* Scoped range styling: filled track + thumb, identical in every browser
          (accent-color renders a different slider per engine). */}
      <style>{`
        .emi-range { -webkit-appearance: none; appearance: none; background: transparent; height: 34px; width: 100%; outline-offset: 4px; }
        .emi-range::-webkit-slider-runnable-track { height: 6px; border-radius: 9999px; background: linear-gradient(to right, #27427f var(--fill, 50%), #e9edf2 var(--fill, 50%)); }
        .emi-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; height: 14px; width: 14px; margin-top: -4px; border-radius: 50%; background: #fff; border: 3px solid #6b7280; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25); cursor: grab; transition: transform 150ms ease-out; }
        .emi-range::-webkit-slider-thumb:hover { transform: scale(1.12); }
        .emi-range:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.12); }
        .emi-range::-moz-range-track { height: 6px; border-radius: 9999px; background: #e9edf2; }
        .emi-range::-moz-range-progress { height: 6px; border-radius: 9999px; background: #27427f; }
        .emi-range::-moz-range-thumb { height: 8px; width: 8px; border-radius: 50%; background: #fff; border: 2px solid #6b7280; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.25); cursor: grab; }
      `}</style>
    <div className="grid! gap-8! lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]!">
      <div className="flex! flex-col! justify-center! gap-7!">
        <SliderRow label="Loan amount" display={inr(principal)} minLabel="₹1L" maxLabel="₹5Cr" min={100000} max={50000000} step={100000} value={principal} onChange={setPrincipal} />
        <SliderRow label="Interest rate" display={`${ratePct.toFixed(2)}% p.a.`} minLabel="7%" maxLabel="15%" min={7} max={15} step={0.05} value={ratePct} onChange={setRatePct} />
        <SliderRow label="Tenure" display={`${years} year${years === 1 ? "" : "s"}`} minLabel="1 yr" maxLabel="30 yrs" min={1} max={30} step={1} value={years} onChange={setYears} />
        <p className="text-[13px]! leading-relaxed! text-gray-600!">
          7.25% is the lowest starting rate on current lender cards (select
          public-sector banks, 800+ CIBIL) — your actual offer depends on
          credit score, income, and loan-to-value.
        </p>
      </div>

      <div className="flex! flex-col! items-center! gap-5! rounded-2xl! bg-gray-50! px-6! py-6!">
        <div className="relative! h-44! w-44!" role="img" aria-label={`Principal versus interest split, EMI ${inr(monthlyEmi)} per month`}>
          <svg viewBox="0 0 120 120" className="h-full! w-full! -rotate-90! drop-shadow-[0_6px_16px_rgba(39,66,127,0.18)]!">
            <circle cx="60" cy="60" r={donutR} fill="none" strokeWidth={donutSw} className="stroke-gray-200!" />
            <circle
              cx="60"
              cy="60"
              r={donutR}
              fill="none"
              strokeWidth={donutSw}
              className="stroke-[#27427f]!"
              strokeDasharray={`${donutC * (1 - interestShare)} ${donutC}`}
            />
            <circle
              cx="60"
              cy="60"
              r={donutR}
              fill="none"
              strokeWidth={donutSw}
              className="stroke-amber-400!"
              strokeDasharray={`${donutC * interestShare} ${donutC}`}
              strokeDashoffset={-donutC * (1 - interestShare)}
            />
          </svg>
          <div className="absolute! inset-0! flex! flex-col! items-center! justify-center! px-8! text-center!">
            <span className="text-xs! text-gray-500!">Monthly EMI</span>
            <span className="whitespace-nowrap! text-xl! leading-tight! font-semibold! text-gray-900! tabular-nums!">{inr(monthlyEmi)}</span>
          </div>
        </div>
        <dl className="w-full! space-y-0! text-sm!">
          <div className="flex! justify-between! gap-4! border-b! border-gray-200! py-2.5!">
            <dt className="flex! items-center! gap-2! font-medium! text-gray-600!"><span className="h-2.5! w-2.5! rounded-full! bg-[#27427f]!" />Principal</dt>
            <dd className="font-semibold! whitespace-nowrap! text-gray-900! tabular-nums!">{inr(principal)}</dd>
          </div>
          <div className="flex! justify-between! gap-4! border-b! border-gray-200! py-2.5!">
            <dt className="flex! items-center! gap-2! font-medium! text-gray-600!"><span className="h-2.5! w-2.5! rounded-full! bg-amber-400!" />Total interest</dt>
            <dd className="font-semibold! whitespace-nowrap! text-gray-900! tabular-nums!">{inr(totalInterest)}</dd>
          </div>
          <div className="flex! justify-between! gap-4! py-2.5!">
            <dt className="font-semibold! text-gray-900!">Total payable</dt>
            <dd className="font-semibold! whitespace-nowrap! text-gray-900! tabular-nums!">{inr(totalPayable)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => setShowSchedule((v) => !v)}
          aria-expanded={showSchedule}
          className="text-sm! font-semibold! text-[#27427f]! cursor-pointer! hover:underline! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2! rounded!"
        >
          {showSchedule ? "Hide yearly schedule" : "Show yearly schedule"}
        </button>
      </div>

      {showSchedule && schedule.length > 0 && (
        <div className="lg:col-span-2! overflow-x-auto! rounded-xl! border! border-gray-200!">
          <table className="w-full! min-w-[560px]! caption-bottom! text-sm!">
            <caption className="sr-only!">Year-wise loan repayment schedule</caption>
            <thead>
              <tr className="bg-gray-50! text-left! text-xs! uppercase! tracking-wide! text-gray-500!">
                <th scope="col" className="px-4! py-2.5! font-semibold!">Year</th>
                <th scope="col" className="px-4! py-2.5! font-semibold! text-right!">Principal</th>
                <th scope="col" className="px-4! py-2.5! font-semibold! text-right!">Interest</th>
                <th scope="col" className="px-4! py-2.5! font-semibold! text-right!">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.year} className="border-t! border-gray-100! tabular-nums!">
                  <th scope="row" className="px-4! py-2! font-medium! text-gray-900!">{row.year}</th>
                  <td className="px-4! py-2! text-right! text-gray-600!">{inr(row.principal)}</td>
                  <td className="px-4! py-2! text-right! text-gray-600!">{inr(row.interest)}</td>
                  <td className="px-4! py-2! text-right! text-gray-900!">{inr(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}
