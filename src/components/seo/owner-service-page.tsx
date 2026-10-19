import Link from "next/link";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { CoreSeoBoundary } from "./core-seo";
import { SeoH1 } from "./core-heading";
export function OwnerServicePage({ rent = false }: { rent?: boolean }) {
  return (
    <CoreSeoBoundary path={rent ? "/rent-property" : "/sell-property"}>
      <SiteHeader />
      <main className="pt-[var(--site-header-h)]! bg-[#f5f7f4]! min-h-screen! font-manrope-page">
        <section className="max-w-5xl! mx-auto! px-6! py-16! space-y-8!">
          <p className="text-sm! text-emerald-700! font-semibold!">
            MAJESTAN REALTY · COIMBATORE
          </p>
          <SeoH1 className="text-4xl! md:text-5xl! font-semibold! text-balance! max-w-3xl!">
            {rent
              ? "Find the right tenant for your property."
              : "Sell your property with local expertise."}
          </SeoH1>
          <p className="text-lg! text-slate-600! max-w-3xl!">
            {rent
              ? "Get help with rental pricing, tenant enquiries and property viewings in Coimbatore."
              : "Discuss your property, understand the local market and connect with interested buyers in Coimbatore."}
          </p>
          <div className="flex! flex-wrap! gap-4!">
            <Link
              href="/contact-us"
              className="inline-flex! bg-emerald-800! text-white! px-6! py-3! rounded-lg!"
            >
              Talk to our team
            </Link>
            <a
              href="tel:+919092965556"
              className="inline-flex! border! border-emerald-800! text-emerald-800! px-6! py-3! rounded-lg!"
            >
              Call +91 90929 65556
            </a>
          </div>
          <div className="grid! md:grid-cols-3! gap-6! pt-8!">
            {[
              [
                "Share your requirements",
                "Tell us the location, property type and your preferred timeline.",
              ],
              [
                "Plan the next steps",
                rent
                  ? "Review rental expectations and arrange property viewings."
                  : "Review pricing expectations and prepare for buyer enquiries.",
              ],
              [
                "Get local support",
                "Our team coordinates enquiries and helps you move forward.",
              ],
            ].map(([title, body]) => (
              <section
                key={title}
                className="bg-white! border! border-slate-200! p-6! rounded-xl!"
              >
                <h2 className="text-xl! font-semibold! mb-4!">{title}</h2>
                <p className="text-slate-600!">{body}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </CoreSeoBoundary>
  );
}
