import Image from "next/image";

import { HERO } from "./content";

/**
 * The legacy page shipped its title as an <h2>, leaving the page with no <h1>.
 * This is the page's single <h1> and its only one.
 *
 * No entrance animation here on purpose — see the note in reveal.tsx. The image
 * is a 722x482 opaque photo shown bare: a white mat and a drop shadow around it
 * put a frame inside the page frame, which reads as a template rather than as
 * this page's own composition.
 */
export function LiaisoningHero() {
  return (
    <section className="pt-10! pb-8! md:pt-16! md:pb-12!" aria-labelledby="liaisoning-hero-heading">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <div className="grid! grid-cols-1! lg:grid-cols-[1.08fr_1fr]! gap-9! md:gap-14! items-center!">
          <div className="max-w-[600px]!">
            <h1
              id="liaisoning-hero-heading"
              className="text-[clamp(32px,4.6vw,48px)]! font-semibold! text-[#161e2d]! leading-[1.06]! tracking-[-0.025em]!"
            >
              {/* Rendered line-by-line so the break is the design's, not the
                  line-breaker's. The legacy had a literal <br> after
                  "Reliable"; at hero sizes in a two-column grid the browser
                  wraps it into three ragged lines instead. The trailing space
                  keeps the accessible name as one string. */}
              {HERO.titleLines.map((line, index) => (
                <span key={line} className="block!">
                  {line}
                  {index < HERO.titleLines.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>

            <p className="mt-[18px]! max-w-[54ch]! text-[15px]! md:text-[16px]! leading-[1.7]! text-gray-600!">
              {HERO.description}
            </p>
          </div>

          <Image
            src={HERO.image}
            alt={HERO.imageAlt}
            width={722}
            height={482}
            priority
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="w-full! h-auto! rounded-[18px]! object-cover!"
          />
        </div>
      </div>
    </section>
  );
}
