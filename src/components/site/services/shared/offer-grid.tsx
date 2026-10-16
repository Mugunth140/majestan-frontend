import { Reveal, RevealItem } from "@/components/site/shared/reveal";
import { SectionIntro } from "./section-intro";
import type {
  SectionIntro as SectionIntroContent,
  ServiceOffer,
} from "./types";

/**
 * A ruled grid, not cards: each offer is a top hairline, a title and its copy,
 * so a section of six reads as one list rather than six boxes. Same reasoning
 * as the liaisoning process list.
 *
 * `tone="white"` puts the section on a white band with hairlines above and
 * below, which is how the liaisoning page alternates its sections.
 */
export function OfferGrid({
  id,
  intro,
  offers,
  columns = 3,
  tone = "plain",
}: {
  id: string;
  intro: SectionIntroContent;
  offers: readonly ServiceOffer[];
  columns?: 2 | 3 | 4;
  tone?: "plain" | "white";
}) {
  const grid = {
    2: "grid-cols-1! md:grid-cols-2!",
    3: "grid-cols-1! md:grid-cols-2! lg:grid-cols-3!",
    4: "grid-cols-1! sm:grid-cols-2! lg:grid-cols-4!",
  }[columns];

  return (
    <section
      className={
        tone === "white"
          ? "py-[56px]! md:py-[76px]! bg-white! border-y! border-gray-200/70!"
          : "py-[52px]! md:py-[72px]!"
      }
      aria-labelledby={`${id}-heading`}
    >
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <Reveal>
          <SectionIntro id={`${id}-heading`} intro={intro} />
        </Reveal>

        <ul className={`grid! ${grid} gap-x-10! lg:gap-x-14!`}>
          {offers.map((offer, index) => (
            <RevealItem
              key={offer.title}
              delay={(index % columns) * 0.06}
              className="border-t! border-gray-200! pt-[20px]! pb-[30px]!"
            >
              <h3 className="text-[16px]! md:text-[17px]! font-medium! text-[#161e2d]! leading-snug!">
                {offer.title}
              </h3>
              {offer.body && (
                <p className="mt-[8px]! text-[14px]! leading-[1.65]! text-gray-600!">
                  {offer.body}
                </p>
              )}
              {offer.points && (
                <ul className="mt-[10px]! space-y-[7px]!">
                  {offer.points.map((point) => (
                    <li
                      key={point}
                      className="relative! pl-[16px]! text-[14px]! leading-[1.6]! text-gray-600! before:absolute! before:left-0! before:top-[0.7em]! before:h-[5px]! before:w-[5px]! before:rounded-full! before:bg-[#27427f]/35! before:content-['']!"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </RevealItem>
          ))}
        </ul>
      </div>
    </section>
  );
}
