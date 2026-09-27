import Image from "next/image";
import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";

import { HERO } from "./content";

/**
 * The legacy page shipped its title as an <h2>, leaving the page with no <h1>.
 * This is the page's single <h1> and its only one.
 *
 * No entrance animation here on purpose — see the note in reveal.tsx. The image
 * is a 722x482 opaque photo, so it gets a real photo treatment (rounded media
 * card) rather than the transparent-render treatment used by the category rail.
 */
export function LiaisoningHero() {
  return (
    <section className="relative! overflow-hidden! pt-8! pb-14! md:pt-14! md:pb-20!">
      {/* Ambient wash — brand navy bled to transparent, never a hard edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none! absolute! -top-40! -right-32! h-[560px]! w-[560px]! rounded-full! opacity-70!"
        style={{
          background:
            "radial-gradient(circle, rgba(39,66,127,0.10) 0%, rgba(39,66,127,0) 68%)",
        }}
      />

      <div className="relative! max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <div className="grid! grid-cols-1! lg:grid-cols-[1.08fr_1fr]! gap-10! md:gap-14! items-center!">
          <div className="max-w-[600px]!">
            <span
              className="liaisoning-eyebrow inline-flex! items-center! gap-2! rounded-full! bg-[#27427f]/[0.07]! px-[13px]! py-[6px]! text-[11px]! font-bold! uppercase! tracking-[0.14em]! text-[#27427f]!"
            >
              <Sparkles className="w-3.5! h-3.5!" />
              {HERO.eyebrow}
            </span>

            <h1
              className="mt-[22px]! text-[clamp(32px,4.6vw,48px)]! font-semibold! text-[#161e2d]! leading-[1.06]! tracking-[-0.025em]!"
            >
              {/* Rendered line-by-line so the break is the design's, not the
                  line-breaker's. The trailing space keeps the accessible name
                  as "Trusted and Reliable Liaisoning" rather than two words
                  fused across block boundaries. */}
              {HERO.titleLines.map((line, index) => (
                <span key={line} className="block!">
                  {line}
                  {index < HERO.titleLines.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>

            <p
              className="mt-5! text-[15px]! md:text-[17px]! font-normal! text-gray-600! leading-[1.65]!"
            >
              {HERO.description}
            </p>

            <ul className="mt-7! flex! flex-wrap! gap-x-6! gap-y-2.5!">
              {[
                { icon: BadgeCheck, label: "DTCP & RERA compliant" },
                { icon: ShieldCheck, label: "Encumbrance-free title verification" },
                { icon: Sparkles, label: "Single compliance file, handed over" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex! items-center! gap-2!">
                  <Icon className="w-4! h-4! text-[#27427f]! shrink-0!" />
                  <span className="text-[13px]! font-medium! text-gray-700! leading-snug!">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative!">
            <div className="relative! rounded-[28px]! overflow-hidden! bg-white! p-2! md:p-2.5! shadow-[0_24px_70px_-28px_rgba(22,30,45,0.35)]! border! border-white/70!">
              <div className="relative! rounded-[22px]! overflow-hidden! bg-[#eef2f8]!">
                <Image
                  src={HERO.image}
                  alt={HERO.imageAlt}
                  width={722}
                  height={482}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full! h-auto! object-cover!"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
