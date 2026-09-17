import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { Sublocation } from "@/lib/api";
import { toLocationSlug } from "@/lib/seo-urls";

type Props = {
  items: Sublocation[];
};

/**
 * "Overview of {locality}" editorial band. Rendered only when at least one
 * managed sublocation has a description (written in Admin → Sublocations).
 */
export function LocalityOverviewSection({ items }: Props) {
  const withCopy = items.filter((s) => s.description && s.description.trim().length > 0);
  if (withCopy.length === 0) return null;

  const cards = withCopy.slice(0, 3);

  return (
    <section className="py-24! bg-white! relative! overflow-hidden!">
      <div className="w-full! max-w-[1400px]! mx-auto! px-4! sm:px-6! md:px-8!">
        <div className="text-center! mb-16!">
          <h2 className="font-['Lexend',sans-serif]! text-[#0a0a0a]! leading-[1.1]! tracking-[-0.02em]! font-light! text-[clamp(30px,4vw,50px)]! mb-4!">
            Locality Overviews
          </h2>
          <p className="text-lg! font-light! text-gray-500! max-w-2xl! mx-auto!">
            Get to know the neighbourhoods — written by our local experts.
          </p>
        </div>

        <div className="grid! grid-cols-1! md:grid-cols-3! gap-6! md:gap-8!">
          {cards.map((loc) => (
            <article
              key={loc.id}
              className="group! flex! flex-col! p-8! rounded-[2rem]! bg-[#f8fafc]! border! border-slate-200/60! transition-all! duration-500! hover:bg-white! hover:shadow-[0_20px_40px_-15px_rgba(39,66,127,0.2)]! hover:-translate-y-2! hover:border-[#27427f]/20!"
            >
              <div className="w-14! h-14! rounded-2xl! bg-white! border! border-slate-200! flex! items-center! justify-center! mb-6! transition-colors! duration-500! group-hover:bg-[#27427f]! group-hover:border-[#27427f]! shrink-0!">
                <MapPin className="w-6! h-6! text-[#27427f]! transition-colors! duration-500! group-hover:text-white!" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl! font-semibold! text-slate-900! font-['Lexend',sans-serif]! tracking-tight! leading-tight!">
                Overview of {loc.sublocation}
              </h3>
              <p className="text-[13px]! font-medium! text-[#27427f]/70! mt-1!">
                {loc.city}{loc.state ? `, ${loc.state}` : ""}
              </p>
              <p className="text-slate-500! text-[15px]! leading-relaxed! mt-4! font-light! grow! line-clamp-4!">
                {loc.description}
              </p>
              <div className="w-full! h-px! bg-slate-200! my-6! transition-colors! duration-500! group-hover:bg-slate-100!"></div>
              <Link
                href={`/for-sale/apartments/${toLocationSlug(loc.city)}`}
                className="flex! items-center! gap-2! text-sm! font-normal! text-slate-900! hover:text-[#27427f]! transition-colors! duration-300! uppercase! tracking-wide! no-underline!"
              >
                <span>Properties in {loc.sublocation}</span>
                <ArrowRight className="w-4! h-4!" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
