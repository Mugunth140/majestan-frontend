"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { AffordabilityCalculator } from "@/components/site/emi/AffordabilityCalculator";
import { EmiCalculator } from "@/components/site/emi/EmiCalculator";
import { Card, TEXT_LINK } from "@/components/site/project/project-ui";

const calculators = [
  { id: "emi", label: "Monthly EMI" },
  {
    id: "affordability",
    label: "Home budget",
  },
] as const;

/** Inline finance tools for buyers comparing this project with their budget. */
export function CalculatorsSection() {
  const [active, setActive] = useState<(typeof calculators)[number]["id"]>("emi");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % calculators.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + calculators.length) % calculators.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = calculators.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const next = calculators[nextIndex];
    setActive(next.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <Card title="Plan your finances" id="calculators">
      <div
        role="tablist"
        aria-label="Project finance calculators"
        className="mt-6! inline-flex! rounded-xl! bg-gray-100! p-1!"
      >
        {calculators.map((calculator, index) => (
          <button
            key={calculator.id}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={`${calculator.id}-calculator-tab`}
            type="button"
            role="tab"
            aria-selected={active === calculator.id}
            aria-controls={`${calculator.id}-calculator-panel`}
            tabIndex={active === calculator.id ? 0 : -1}
            onClick={() => setActive(calculator.id)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
            className={`rounded-lg! px-4! py-2! text-sm! font-semibold! transition-colors! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2! ${
              active === calculator.id
                ? "bg-white! text-[#27427f]! shadow-sm!"
                : "text-gray-600! hover:text-gray-900!"
            }`}
          >
            {calculator.label}
          </button>
        ))}
      </div>

      <div
        id="emi-calculator-panel"
        role="tabpanel"
        aria-labelledby="emi-calculator-tab"
        tabIndex={0}
        hidden={active !== "emi"}
        className="mt-6! rounded-lg! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
      >
        <EmiCalculator />
        <Link href="/emi-calculator" className={`mt-6! inline-flex! text-sm! font-semibold! ${TEXT_LINK}`}>
          Open the full EMI calculator
        </Link>
      </div>

      <div
        id="affordability-calculator-panel"
        role="tabpanel"
        aria-labelledby="affordability-calculator-tab"
        tabIndex={0}
        hidden={active !== "affordability"}
        className="mt-6! rounded-lg! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
      >
        <AffordabilityCalculator />
        <Link href="/affordability-calculator" className={`mt-6! inline-flex! text-sm! font-semibold! ${TEXT_LINK}`}>
          Open the full affordability calculator
        </Link>
      </div>
    </Card>
  );
}
