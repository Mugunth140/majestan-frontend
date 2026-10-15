"use client";

import { useState } from "react";
import type { SeoProperty } from "@/lib/api/property-by-slug";
import { loanTotals } from "@/lib/emi";
import { PROJECT_FINANCE_ASSUMPTIONS } from "@/lib/project-finance";
import { FinanceBreakdown, FinanceSection } from "@/components/site/shared/FinanceCalculator";
import styles from "@/components/site/project/overview/project-finance.module.css";

export function PropertyFinanceSection({ property }: { property: SeoProperty }) {
  if (isRentalProperty(property)) return null;
  const price = Number(property.price);
  return (
    <FinanceSection emptyMessage="Estimates will appear when a sale price is available for this property.">
      {Number.isFinite(price) && price > 0 ? <PropertyFinanceWidget key={property.id} price={price} /> : null}
    </FinanceSection>
  );
}

export function isRentalProperty(property: Pick<SeoProperty, "listingType" | "status">) {
  return ["rent", "rental", "lease"].includes(property.listingType?.toLowerCase()) || property.status.toLowerCase().includes("rent");
}

function PropertyFinanceWidget({ price }: { price: number }) {
  const [rate, setRate] = useState<number>(PROJECT_FINANCE_ASSUMPTIONS.annualRatePct);
  const [years, setYears] = useState<number>(PROJECT_FINANCE_ASSUMPTIONS.years);
  const [loanPct, setLoanPct] = useState<number>(100 - PROJECT_FINANCE_ASSUMPTIONS.downPaymentPct);
  const loanAmount = price * loanPct / 100;
  const estimate = {
    propertyPrice: price,
    downPayment: price - loanAmount,
    loanAmount,
    ...loanTotals(loanAmount, rate, years),
  };
  return (
    <div className={styles.widget}>
      <FinanceBreakdown estimate={estimate} rate={rate} years={years} loanPct={loanPct}
        onRateChange={setRate} onYearsChange={setYears} onLoanPctChange={setLoanPct} priceLabel="property" />
    </div>
  );
}
