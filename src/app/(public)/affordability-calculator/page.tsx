import type { Metadata } from "next";
import Link from "next/link";
import { AffordabilityCalculator } from "@/components/site/emi/AffordabilityCalculator";
import { getSeo, seoMetadata } from "@/lib/seo-engine";
import { CoreSeoBoundary } from "@/components/seo/core-seo";
import { SeoH1 } from "@/components/seo/core-heading";

const defaultMetadata: Metadata = {
  alternates: { canonical: "/affordability-calculator" },
  title: "Home Affordability Calculator — What Home Value Your Income Supports",
  description:
    "Find the home value your income supports from your salary, existing EMIs, interest rate, tenure and down payment. Bank-style 50% FOIR estimate with max loan and EMI.",
};

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata(await getSeo('/affordability-calculator'), defaultMetadata);
}

export default function AffordabilityCalculatorPage() {
  return (
    <CoreSeoBoundary path="/affordability-calculator">
    <main className="font-manrope-page mx-auto! w-full! max-w-6xl! px-4! pb-10! pt-[calc(var(--site-header-h,64px)+24px)]! md:px-8!">
      <SeoH1 className="text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight! text-balance!">
        Home affordability calculator
      </SeoH1>
      <p className="mt-2! max-w-2xl! text-base! text-gray-600!">
        Tell us your income and obligations to see the home value you can afford,
        the loan behind it, and the EMI it needs.{" "}
        <Link href="/emi-calculator" className="font-semibold! text-[#27427f]! hover:underline!">
          Have a price in mind? Check its EMI instead.
        </Link>
      </p>

      <section aria-label="Affordability calculator" className="mt-8! lg:mt-12!">
        <AffordabilityCalculator />
      </section>
    </main>
    </CoreSeoBoundary>
  );
}
