import type { Metadata } from "next";
import { EmiCalculator } from "@/components/site/emi/EmiCalculator";
import { BANK_RATES, BANK_RATES_UPDATED } from "@/lib/emi-bank-rates";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator — Monthly EMI at the Lowest Interest Rates",
  description:
    "Estimate your home loan EMI with sliders for loan amount, interest rate and tenure. Compare starting home loan rates from Indian banks and see a year-wise repayment schedule.",
};

export default function EmiCalculatorPage() {
  return (
    <main className="font-manrope-page mx-auto! w-full! max-w-6xl! px-4! pb-10! pt-[calc(var(--site-header-h,64px)+24px)]! md:px-8!">
      <h1 className="text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight! text-balance!">
        Home loan EMI calculator
      </h1>
      <p className="mt-2! max-w-2xl! text-base! text-gray-600!">
        Move the sliders to see your monthly EMI, total interest, and how each year&apos;s
        payment splits between principal and interest.
      </p>

      <section aria-label="EMI calculator" className="mt-8! md:p-8!">
        <EmiCalculator />
      </section>

      <section aria-label="Bank home loan rates" className="mt-10!">
        <h2 className="text-2xl! font-semibold! text-gray-900! tracking-tight!">
          Starting home loan rates
        </h2>
        <p className="mt-1! text-sm! text-gray-600!">
          Published starting rates, updated {BANK_RATES_UPDATED}. Your actual rate depends
          on credit score, income, and loan-to-value — confirm with the lender before applying.
        </p>
        <div className="mt-4! overflow-x-auto! rounded-xl! border! border-gray-200! bg-white!">
          <table className="w-full! min-w-[560px]! caption-bottom! text-sm!">
            <caption className="sr-only!">Starting home loan interest rates by lender</caption>
            <thead>
              <tr className="bg-gray-50! text-left! text-xs! uppercase! tracking-wide! text-gray-500!">
                <th scope="col" className="px-4! py-2.5! font-semibold!">Lender</th>
                <th scope="col" className="px-4! py-2.5! font-semibold!">Type</th>
                <th scope="col" className="px-4! py-2.5! font-semibold! text-right!">Starts at</th>
                <th scope="col" className="px-4! py-2.5! font-semibold! text-right!">Range</th>
              </tr>
            </thead>
            <tbody>
              {BANK_RATES.map((bank) => (
                <tr key={bank.lender} className="border-t! border-gray-100! tabular-nums!">
                  <th scope="row" className="px-4! py-2! font-medium! text-gray-900!">{bank.lender}</th>
                  <td className="px-4! py-2! text-gray-600!">{bank.type}</td>
                  <td className="px-4! py-2! text-right! font-semibold! text-[#27427f]!">{bank.floorPct.toFixed(2)}%</td>
                  <td className="px-4! py-2! text-right! text-gray-600!">{bank.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
